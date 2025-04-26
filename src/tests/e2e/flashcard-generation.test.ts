import { test, expect } from "@playwright/test";

const SAMPLE_TEXT = `Commerce on the Internet has come to rely almost exclusively on financial institutions serving as trusted third parties to process electronic payments. While the system works well enough for most transactions, it still suffers from the inherent weaknesses of the trust based model.
Completely non-reversible transactions are not really possible, since financial institutions cannot avoid mediating disputes.`;

test.describe("Flashcard Generation Flow", () => {
  test("should generate flashcards from input text", async ({ page }) => {
    // Navigate to the homepage where flashcard generation is available
    await page.goto("/");

    // Wait for the page to be fully loaded
    await page.waitForLoadState("networkidle");

    // 1. Find the text input area using data-testid and paste the text
    const textArea = page.getByTestId("to-generate-text");
    await expect(textArea).toBeVisible();
    await textArea.fill(SAMPLE_TEXT);

    // 2. Find the generate button
    const generateButton = page
      .getByRole("button")
      .filter({ hasText: /generate/i })
      .first();
    await expect(generateButton).toBeVisible();
    await generateButton.click();

    // 3. Wait for loading state
    const loadingIndicator = page.getByTestId("loading-indicator");
    await expect(loadingIndicator).toBeVisible();
    await expect(loadingIndicator).not.toBeVisible({ timeout: 60000 }); // Increase timeout for AI processing

    // 4. Verify that flashcards were generated
    const candidateReviewArea = page.getByTestId("candidate-review-area");
    await expect(candidateReviewArea).toBeVisible();

    // Additional verification - check if at least one flashcard is present
    const flashcards = page.getByTestId("flashcard-candidate");
    await expect(flashcards.first()).toBeVisible();
  });
});
