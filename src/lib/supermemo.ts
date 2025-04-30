/**
 * Implementation of the SuperMemo 2 (SM2) algorithm
 * Based on: https://super-memory.com/english/ol/sm2.htm
 * 
 * The algorithm helps determine optimal intervals for spaced repetition
 * based on how well the user remembers the information.
 */

/**
 * SuperMemo grade values:
 * 0 - complete blackout
 * 1 - incorrect response; the correct one remembered
 * 2 - incorrect response; where the correct one seemed easy to recall
 * 3 - correct response recalled with serious difficulty
 * 4 - correct response after a hesitation
 * 5 - perfect response
 */
export type SuperMemoGrade = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * SuperMemo item structure representing the learning state of a flashcard
 */
export interface SuperMemoItem {
  /** inter-repetition interval in days */
  interval: number;
  /** the number of consecutive correct responses */
  repetition: number;
  /** easiness factor reflecting the ease of memorizing and retaining */
  efactor: number;
}

/**
 * Default/initial values for a SuperMemo item
 */
export const DEFAULT_SUPERMEMO_ITEM: SuperMemoItem = {
  interval: 0,
  repetition: 0,
  efactor: 2.5,
};

/**
 * Calculates the next review parameters using the SuperMemo 2 algorithm
 * 
 * @param item - The current state of the flashcard
 * @param grade - The grade assigned by the user (0-5)
 * @returns The updated SuperMemo item with new interval, repetition, and efactor
 */
export function supermemo(item: SuperMemoItem, grade: SuperMemoGrade): SuperMemoItem {
  // Make a copy to avoid mutating the original
  const result: SuperMemoItem = { ...item };
  
  // If the quality of the response was lower than 3, 
  // start repetitions for the item from the beginning without changing the E-Factor
  if (grade < 3) {
    result.repetition = 0;
    result.interval = 1;
  } else {
    // If the quality response was 3 or higher
    // Increment the repetition counter
    result.repetition += 1;
    
    // Set the interval based on the repetition number
    if (result.repetition === 1) {
      result.interval = 1;
    } else if (result.repetition === 2) {
      result.interval = 6;
    } else {
      // For repetitions > 2, multiply the previous interval by the efactor
      result.interval = Math.round(result.interval * result.efactor);
    }
  }
  
  // Update the easiness factor (EF)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // where q is the quality of the response (0-5)
  const newEFactor = 
    result.efactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  
  // EF is allowed to range between 1.3 and 2.5
  result.efactor = Math.max(1.3, newEFactor);
  
  return result;
}

/**
 * Calculates the next review date based on a given interval
 * 
 * @param interval - The interval in days
 * @param from - Optional reference date (defaults to current date)
 * @returns The calculated next review date
 */
export function calculateNextReviewDate(interval: number, from: Date = new Date()): Date {
  const nextDate = new Date(from);
  nextDate.setDate(nextDate.getDate() + interval);
  return nextDate;
}

/**
 * Checks if a flashcard is due for review
 * 
 * @param nextReviewDate - The scheduled next review date
 * @returns True if the card is due for review, false otherwise
 */
export function isDue(nextReviewDate: Date | string | null): boolean {
  if (!nextReviewDate) return true;
  
  const reviewDate = typeof nextReviewDate === 'string' 
    ? new Date(nextReviewDate) 
    : nextReviewDate;
    
  const now = new Date();
  
  return reviewDate <= now;
} 