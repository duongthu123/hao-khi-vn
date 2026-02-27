/**
 * Quiz data validation utility
 * Validates quiz questions against the schema
 */

import { QuizQuestionSchema } from '@/schemas/quiz.schema';
import type { QuizQuestion } from '@/schemas/quiz.schema';

/**
 * Validates an array of quiz questions
 * @param questions - Array of quiz questions to validate
 * @returns Validated quiz questions
 * @throws Error if validation fails with detailed error messages
 */
export function validateQuizQuestions(questions: unknown[]): QuizQuestion[] {
  if (!Array.isArray(questions)) {
    throw new Error('Dữ liệu câu hỏi phải là một mảng');
  }

  if (questions.length === 0) {
    throw new Error('Mảng câu hỏi không được rỗng');
  }

  const validatedQuestions: QuizQuestion[] = [];
  const errors: string[] = [];

  questions.forEach((question, index) => {
    try {
      const validated = QuizQuestionSchema.parse(question);
      validatedQuestions.push(validated);
    } catch (error) {
      if (error instanceof Error) {
        // Parse Zod error for more specific messages
        const errorMsg = error.message.includes('correctAnswer')
          ? 'Chỉ số câu trả lời đúng không hợp lệ'
          : error.message.includes('difficulty')
          ? 'Độ khó không hợp lệ (phải là: easy, medium, hoặc hard)'
          : error.message.includes('category')
          ? 'Danh mục không hợp lệ (phải là: history, strategy, hoặc culture)'
          : error.message.includes('answers')
          ? 'Danh sách câu trả lời không hợp lệ (cần ít nhất 2 câu trả lời)'
          : error.message;
        errors.push(`Câu hỏi ${index + 1}: ${errorMsg}`);
      } else {
        errors.push(`Câu hỏi ${index + 1}: Xác thực thất bại`);
      }
    }
  });

  if (errors.length > 0) {
    throw new Error(`Xác thực câu hỏi thất bại:\n${errors.join('\n')}`);
  }

  return validatedQuestions;
}

/**
 * Loads and validates quiz questions from JSON data
 * @param data - Raw JSON data
 * @returns Validated quiz questions
 * @throws Error with descriptive message if validation fails
 */
export function loadQuizQuestions(data: unknown): QuizQuestion[] {
  if (!Array.isArray(data)) {
    throw new Error('Dữ liệu câu hỏi phải là một mảng JSON');
  }

  if (data.length === 0) {
    throw new Error('Không có câu hỏi nào trong dữ liệu');
  }

  return validateQuizQuestions(data);
}
