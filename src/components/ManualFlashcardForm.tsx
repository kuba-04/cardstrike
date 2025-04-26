import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { CreateFlashcardCommand, CreateFlashcardResponseDTO } from "../types";

export default function ManualFlashcardForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateFlashcardCommand>({
    front_text: "",
    back_text: "",
  });
  const [errors, setErrors] = useState({
    front_text: "",
    back_text: "",
  });

  const validateField = (name: keyof CreateFlashcardCommand, value: string) => {
    if (!value.trim()) {
      return `${name === "front_text" ? "Question" : "Answer"} is required`;
    }
    if (value.length > 1000) {
      return "Text cannot exceed 1000 characters";
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name as keyof CreateFlashcardCommand, value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {
      front_text: validateField("front_text", formData.front_text),
      back_text: validateField("back_text", formData.back_text),
    };
    setErrors(newErrors);

    if (newErrors.front_text || newErrors.back_text) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create flashcard");
      }

      const data: CreateFlashcardResponseDTO = await response.json();
      toast.success("Success!", {
        description: data.message || "Flashcard created successfully",
      });

      // Reset form
      setFormData({ front_text: "", back_text: "" });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to create flashcard. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Create a New Flashcard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="front_text">Question</Label>
            <Input
              id="front_text"
              name="front_text"
              value={formData.front_text}
              onChange={handleChange}
              placeholder="Enter the question"
              aria-describedby="front_text-error"
            />
            {errors.front_text && (
              <p id="front_text-error" className="text-sm text-red-500">
                {errors.front_text}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="back_text">Answer</Label>
            <Textarea
              id="back_text"
              name="back_text"
              value={formData.back_text}
              onChange={handleChange}
              placeholder="Enter the answer"
              aria-describedby="back_text-error"
            />
            {errors.back_text && (
              <p id="back_text-error" className="text-sm text-red-500">
                {errors.back_text}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating..." : "Create Flashcard"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
