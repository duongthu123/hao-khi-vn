# QuizModule Component

Educational quiz interface for "Đại Chiến Sử Việt - Hào Khí Đông A" game.

## Features

- **Question Presentation**: Displays quiz questions with multiple choice answers
- **Timer System**: 30-second countdown timer per question (disabled in training mode)
- **Immediate Feedback**: Shows correct/incorrect feedback with explanations
- **Historical Context**: Displays educational explanations for each answer
- **Progress Tracking**: Visual progress bar and score display
- **Difficulty Levels**: Easy, Medium, and Hard questions
- **Categories**: History, Strategy, and Culture questions
- **Completion Screen**: Shows final score with performance feedback
- **Quiz Restart**: Allows restarting the quiz with shuffled questions
- **Training Mode**: Practice mode with hints, no timer, and no score tracking
  - Tutorial hints based on question category
  - No time pressure for learning
  - No rewards or statistics tracking
  - Perfect for learning without consequences

## Usage

```tsx
import { QuizModule } from '@/components/game/QuizModule';

function GamePage() {
  const handleQuizComplete = (score: number, correct: number, total: number) => {
    console.log(`Quiz completed! Score: ${correct}/${total}`);
  };

  const handleReward = (reward: { type: string; id: string; amount?: number }) => {
    console.log('Reward earned:', reward);
  };

  return (
    <>
      {/* Regular quiz mode with timer and rewards */}
      <QuizModule
        mode="quiz"
        onComplete={handleQuizComplete}
        onReward={handleReward}
      />
      
      {/* Training mode for practice */}
      <QuizModule
        mode="training"
        onComplete={handleQuizComplete}
      />
    </>
  );
}
```

## Props

### QuizModuleProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onComplete` | `(score: number, correctAnswers: number, totalQuestions: number) => void` | No | Callback when quiz is completed |
| `onReward` | `(reward: { type: string; id: string; amount?: number }) => void` | No | Callback when reward is earned (quiz mode only) |
| `className` | `string` | No | Additional CSS classes |
| `mode` | `'quiz' \| 'training'` | No | Quiz mode (default: 'quiz'). Training mode disables timer, rewards, and statistics |

## Data Structure

Quiz questions are loaded from `/data/quiz-questions.json` and validated using Zod schemas.

### Question Format

```json
{
  "id": "unique-id",
  "question": "Question text in Vietnamese",
  "answers": ["Answer 1", "Answer 2", "Answer 3", "Answer 4"],
  "correctAnswer": 0,
  "explanation": "Detailed explanation in Vietnamese",
  "difficulty": "easy" | "medium" | "hard",
  "category": "history" | "strategy" | "culture"
}
```

## Features Detail

### Timer System
- Each question has a 30-second time limit in quiz mode
- Timer displays in red when 10 seconds or less remain
- Auto-submits when time runs out
- No timer in training mode for stress-free learning

### Training Mode
- Accessible via `mode="training"` prop
- Features:
  - No time limit - take as long as you need
  - Tutorial hints available for each question
  - Hints are contextual based on question category
  - No rewards or experience points
  - No statistics tracking
  - Perfect for learning and practice
- Visual indicator shows training mode is active
- Different completion message encouraging real quiz attempt

### Feedback System
- Immediate visual feedback (green for correct, red for incorrect)
- Displays explanation and historical context
- Shows which answer was correct

### Progress Tracking
- Progress bar shows completion percentage
- Current score displayed in header
- Question counter (e.g., "Câu hỏi 1 / 20")

### Completion Screen
- Final score as percentage
- Performance message based on score:
  - 80%+: "Xuất sắc!" (Excellent)
  - 60-79%: "Tốt lắm!" (Good)
  - <60%: "Cố gắng lên!" (Keep trying)
- Option to restart quiz

## Styling

The component uses Tailwind CSS with Vietnamese cultural theme colors:
- Primary color: `vietnam-500` (blue)
- Success: Green tones
- Error: Red tones
- Difficulty badges: Green (easy), Yellow (medium), Red (hard)
- Category badges: Blue tones

## Accessibility

- Keyboard navigation support
- Focus management
- ARIA labels for screen readers
- Color contrast ratios meet WCAG standards

## Requirements Validated

- **15.1**: Presents historical questions about Trần Dynasty and Mongol invasions
- **15.2**: Validates player answers and provides feedback
- **15.5**: Displays questions and answers in Vietnamese
- **15.6**: Implements training mode for practicing combat scenarios with hints and guidance
- **2.2**: Implements as React component
- **2.3**: Uses proper TypeScript types

## Related Files

- `src/schemas/quiz.schema.ts` - Zod validation schemas
- `src/lib/validation/validateQuizData.ts` - Quiz data validation
- `public/data/quiz-questions.json` - Quiz question data
- `src/components/game/QuizModule/QuizModule.test.tsx` - Unit tests
