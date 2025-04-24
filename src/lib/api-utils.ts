export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    
    if (response.status === 401) {
      throw new Error('Please sign in to continue');
    }
    
    // Use the error message from the API if available
    if (errorData?.error) {
      throw new Error(errorData.error);
    }

    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
} 