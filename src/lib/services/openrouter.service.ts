import { z } from 'zod';

// Custom error types
export class OpenRouterError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

export class OpenRouterNetworkError extends OpenRouterError {
  constructor(message: string, public readonly status?: number, cause?: unknown) {
    super(message, cause);
    this.name = 'OpenRouterNetworkError';
  }
}

export class OpenRouterValidationError extends OpenRouterError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'OpenRouterValidationError';
  }
}

export class OpenRouterProviderError extends OpenRouterError {
  constructor(
    message: string, 
    public readonly providerName: string,
    public readonly code: number,
    public readonly rawError?: unknown
  ) {
    super(message);
    this.name = 'OpenRouterProviderError';
  }
}

// Response schema validation
export const OpenRouterResponseSchema = z.object({
  choices: z.array(z.object({
    message: z.object({
      content: z.string(),
      role: z.string()
    }),
    finish_reason: z.string().optional()
  })),
  model: z.string(),
  usage: z.object({
    completion_tokens: z.number(),
    prompt_tokens: z.number(),
    total_tokens: z.number()
  })
});

export type OpenRouterResponse = z.infer<typeof OpenRouterResponseSchema>;

export interface ModelParameters {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ServiceConfig extends ModelParameters {
  systemMessage?: string;
  modelName?: string;
  apiUrl?: string;
}

export interface RequestPayload {
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  model: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export class OpenRouterService {
  private _defaultSystemMessage: string;
  private _modelName: string;
  private _apiUrl: string;
  private _modelParameters: ModelParameters;
  private readonly _headers: HeadersInit;
  private readonly _logger: Console;
  private readonly _maxRetries = 3;
  private readonly _retryDelay = 1000; // 1 second

  constructor() {
    // Initialize with environment variables
    this._defaultSystemMessage = import.meta.env.OPENROUTER_DEFAULT_SYSTEM_MESSAGE || 'You are a helpful assistant.';
    this._modelName = import.meta.env.OPENROUTER_MODEL_NAME || 'qwen/qwq-32b:free';
    this._apiUrl = import.meta.env.OPENROUTER_API_URL;

    // Default model parameters
    this._modelParameters = {
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    };

    // Initialize headers
    this._headers = {
      'Authorization': `Bearer ${import.meta.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': import.meta.env.OPENROUTER_HTTP_REFERER || 'http://localhost:3001',
      'X-Title': 'CardStrike'
    };

    this._logger = console;
  }

  public async sendRequest(userMessage: string): Promise<OpenRouterResponse> {
    try {
      const payload = this._buildPayload(userMessage);
      const response = await this._executeRequest(payload);
      return this._parseResponse(response);
    } catch (error) {
      this._logger.error('Error sending request to OpenRouter:', error);
      throw error;
    }
  }

  public configure(config: ServiceConfig): void {
    if (config.systemMessage) this._defaultSystemMessage = config.systemMessage;
    if (config.modelName) this._modelName = config.modelName;
    if (config.apiUrl) {
      this._apiUrl = config.apiUrl;
    }

    // Update model parameters
    const { temperature, max_tokens, top_p, frequency_penalty, presence_penalty } = config;
    Object.assign(this._modelParameters, {
      temperature, max_tokens, top_p, frequency_penalty, presence_penalty
    });
  }

  private _buildPayload(userMessage: string): RequestPayload {
    return {
      messages: [
        { role: 'system', content: this._defaultSystemMessage },
        { role: 'user', content: userMessage }
      ],
      model: this._modelName,
      ...this._modelParameters
    };
  }

  private async _executeRequest(payload: RequestPayload, retryCount = 0): Promise<any> {
    try {
      const response = await fetch(this._apiUrl, {
        method: 'POST',
        headers: this._headers,
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      // Check for provider errors first
      if (responseData.error?.metadata?.provider_name) {
        const { error } = responseData;
        throw new OpenRouterProviderError(
          `${error.metadata.provider_name} API error: ${error.message}`,
          error.metadata.provider_name,
          error.code,
          error.metadata.raw
        );
      }

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429 && retryCount < this._maxRetries) {
          const delay = this._retryDelay * Math.pow(2, retryCount);
          this._logger.warn(`Rate limited, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this._executeRequest(payload, retryCount + 1);
        }

        throw new OpenRouterNetworkError(
          `HTTP error ${response.status}: ${response.statusText}`,
          response.status,
          responseData
        );
      }

      return responseData;
    } catch (error) {
      if (error instanceof OpenRouterError) {
        throw error;
      }

      // Handle network errors
      throw new OpenRouterNetworkError(
        'Network error: Failed to connect to OpenRouter API',
        undefined,
        error
      );
    }
  }

  private _parseResponse(apiResponse: any): OpenRouterResponse {
    try {
      const result = OpenRouterResponseSchema.parse(apiResponse);
      return result;
    } catch (error) {
      this._logger.error('Failed to parse OpenRouter response:', apiResponse);
      throw new OpenRouterValidationError(
        'Invalid response format received from OpenRouter API',
        error
      );
    }
  }
} 