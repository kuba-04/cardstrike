import { useState } from "react";
import { useForm, type FieldValues, type UseFormReturn, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { toast } from "sonner";

interface UseAuthFormOptions<T extends FieldValues> {
  schema: z.ZodSchema<T>;
  onSubmit: SubmitHandler<T>;
}

interface UseAuthFormReturn<T extends FieldValues> {
  form: UseFormReturn<T>;
  error: string | null;
  isSubmitting: boolean;
  handleSubmit: () => Promise<void>;
}

export function useAuthForm<T extends FieldValues>({ schema, onSubmit }: UseAuthFormOptions<T>): UseAuthFormReturn<T> {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<T>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsSubmitting(true);
      await form.handleSubmit(onSubmit)();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, error, isSubmitting, handleSubmit };
}
