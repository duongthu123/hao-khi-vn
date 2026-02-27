'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizQuestion } from '@/schemas/quiz.schema';
import { loadQuizQuestions } from '@/lib/validation/validateQuizData';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QuizModuleSkeleton } from './QuizModuleSkeleton';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store';
import { ResourceType } from '@/types/resource';
import { useSpeech, formatSpeechError } from '@/hooks/useSpeech';

export interface QuizModuleProps {
  onComplete?: (score: number, correctAnswers: number, totalQuestions: number) => void;
  onReward?: (reward: { type: string; id: string; amount?: number }) => void;
  className?: string;
  mode?: 'quiz' | 'training';
}

interface QuizState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  answeredQuestions: Map<number, number>;
  showFeedback: boolean;
  isCorrect: boolean;
  timeRemaining: number;
  quizCompleted: boolean;
  showHint: boolean;
  currentMode: 'quiz' | 'training';
  speechEnabled: boolean;
  voiceAnswerMode: boolean;
  speechError: string | null;
}

const QUESTION_TIME_LIMIT = 30; // seconds per question

export function QuizModule({ onComplete, onReward, className, mode = 'quiz' }: QuizModuleProps) {
  // Get store actions
  const recordAnswer = useGameStore((state) => state.recordAnswer);
  const addReward = useGameStore((state) => state.addReward);
  const addResource = useGameStore((state) => state.addResource);
  const incrementStats = useGameStore((state) => state.incrementStats);
  const addExperience = useGameStore((state) => state.addExperience);
  
  // Initialize speech hook
  const {
    supported: speechSupported,
    speaking,
    listening,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    error: speechHookError,
  } = useSpeech();
  
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    selectedAnswer: null,
    answeredQuestions: new Map(),
    showFeedback: false,
    isCorrect: false,
    timeRemaining: QUESTION_TIME_LIMIT,
    quizCompleted: false,
    showHint: false,
    currentMode: mode,
    speechEnabled: false,
    voiceAnswerMode: false,
    speechError: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load quiz questions on mount
  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await fetch('/data/quiz-questions.json');
        if (!response.ok) {
          throw new Error(`Không thể tải câu hỏi (HTTP ${response.status}). Vui lòng kiểm tra file dữ liệu.`);
        }
        
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          throw new Error('Dữ liệu câu hỏi không đúng định dạng JSON. Vui lòng kiểm tra cú pháp file.');
        }
        
        // Validate quiz data structure
        let validatedQuestions;
        try {
          validatedQuestions = loadQuizQuestions(data);
        } catch (validationError) {
          const errorMessage = validationError instanceof Error 
            ? validationError.message 
            : 'Dữ liệu câu hỏi không hợp lệ';
          throw new Error(`Lỗi xác thực dữ liệu: ${errorMessage}`);
        }
        
        if (validatedQuestions.length === 0) {
          throw new Error('Không có câu hỏi nào trong file dữ liệu.');
        }
        
        // Shuffle questions for variety
        const shuffled = [...validatedQuestions].sort(() => Math.random() - 0.5);
        
        setQuizState(prev => ({
          ...prev,
          questions: shuffled,
        }));
        setLoading(false);
      } catch (err) {
        console.error('Quiz loading error:', err);
        setError(err instanceof Error ? err.message : 'Không thể tải câu hỏi. Vui lòng thử lại sau.');
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

  // Timer countdown
  useEffect(() => {
    // No timer in training mode
    if (loading || quizState.showFeedback || quizState.quizCompleted || quizState.currentMode === 'training') {
      return;
    }

    const timer = setInterval(() => {
      setQuizState(prev => {
        if (prev.timeRemaining <= 1) {
          // Time's up - auto-submit with no answer
          handleAnswerSubmit(null);
          return prev;
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, quizState.showFeedback, quizState.quizCompleted, quizState.currentQuestionIndex, quizState.currentMode]);

  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];

  // Shuffle answer indices for current question (randomize button order)
  const shuffledAnswerIndices = useMemo(() => {
    if (!currentQuestion) return [];
    const indices = currentQuestion.answers.map((_, i) => i);
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizState.currentQuestionIndex, quizState.questions]);

  const score = useMemo(() => {
    let correct = 0;
    quizState.answeredQuestions.forEach((answer, questionIndex) => {
      if (answer === quizState.questions[questionIndex]?.correctAnswer) {
        correct++;
      }
    });
    return correct;
  }, [quizState.answeredQuestions, quizState.questions]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (!quizState.showFeedback) {
      setQuizState(prev => ({
        ...prev,
        selectedAnswer: answerIndex,
      }));
    }
  };

  const handleAnswerSubmit = (answer: number | null) => {
    if (quizState.showFeedback) return;

    // Validate answer input
    if (answer !== null && (answer < 0 || answer >= currentQuestion.answers.length)) {
      console.error('Invalid answer index:', answer);
      return;
    }

    const isCorrect = answer === currentQuestion.correctAnswer;
    
    // Only record answer and give rewards in quiz mode
    if (quizState.currentMode === 'quiz') {
      recordAnswer(isCorrect, currentQuestion.category);
    }
    
    setQuizState(prev => {
      const newAnsweredQuestions = new Map(prev.answeredQuestions);
      if (answer !== null) {
        newAnsweredQuestions.set(prev.currentQuestionIndex, answer);
      }
      
      return {
        ...prev,
        answeredQuestions: newAnsweredQuestions,
        showFeedback: true,
        isCorrect,
      };
    });

    // Award rewards for correct answer only in quiz mode
    if (isCorrect && quizState.currentMode === 'quiz') {
      // Calculate reward based on difficulty
      const rewardAmount = currentQuestion.difficulty === 'hard' ? 100 
        : currentQuestion.difficulty === 'medium' ? 75 
        : 50;
      
      const reward = {
        type: 'resource' as const,
        id: 'gold',
        amount: rewardAmount,
      };
      
      // Add reward to quiz state
      addReward(reward);
      
      // Add gold to resources
      addResource(ResourceType.GOLD, rewardAmount);
      
      // Add experience points
      const expAmount = currentQuestion.difficulty === 'hard' ? 50 
        : currentQuestion.difficulty === 'medium' ? 30 
        : 20;
      addExperience(expAmount);
      
      // Call onReward callback if provided
      if (onReward) {
        onReward(reward);
      }
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = quizState.currentQuestionIndex + 1;
    
    if (nextIndex >= quizState.questions.length) {
      // Quiz completed - update profile statistics only in quiz mode
      const finalScore = score + (quizState.isCorrect ? 1 : 0);
      
      if (quizState.currentMode === 'quiz') {
        incrementStats('quizzesCompleted', 1);
      }
      
      setQuizState(prev => ({
        ...prev,
        quizCompleted: true,
      }));
      
      if (onComplete) {
        onComplete(finalScore, finalScore, quizState.questions.length);
      }
    } else {
      // Move to next question
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        selectedAnswer: null,
        showFeedback: false,
        isCorrect: false,
        timeRemaining: QUESTION_TIME_LIMIT,
        showHint: false,
      }));
    }
  };

  const handleRestartQuiz = () => {
    const shuffled = [...quizState.questions].sort(() => Math.random() - 0.5);
    setQuizState({
      questions: shuffled,
      currentQuestionIndex: 0,
      selectedAnswer: null,
      answeredQuestions: new Map(),
      showFeedback: false,
      isCorrect: false,
      timeRemaining: QUESTION_TIME_LIMIT,
      quizCompleted: false,
      showHint: false,
      currentMode: quizState.currentMode,
      speechEnabled: quizState.speechEnabled,
      voiceAnswerMode: false,
      speechError: null,
    });
  };

  const handleToggleHint = () => {
    setQuizState(prev => ({
      ...prev,
      showHint: !prev.showHint,
    }));
  };

  const getHintForQuestion = (question: QuizQuestion): string => {
    // Generate contextual hints based on question category and difficulty
    const hints: Record<string, string[]> = {
      history: [
        'Hãy nhớ lại các sự kiện lịch sử quan trọng trong thời kỳ Trần.',
        'Suy nghĩ về vai trò của các vị tướng và chiến lược trong trận chiến.',
        'Xem xét bối cảnh lịch sử và thời gian của các sự kiện.',
      ],
      strategy: [
        'Phân tích ưu điểm và nhược điểm của từng lựa chọn chiến thuật.',
        'Xem xét địa hình và điều kiện chiến đấu.',
        'Suy nghĩ về cách các chiến lược này được áp dụng trong lịch sử.',
      ],
      culture: [
        'Nhớ lại các giá trị văn hóa truyền thống Việt Nam.',
        'Xem xét ảnh hưởng của văn hóa đến chiến lược quân sự.',
        'Suy nghĩ về di sản văn hóa từ thời kỳ Trần.',
      ],
    };

    const categoryHints = hints[question.category] || hints.history;
    const hintIndex = Math.floor(Math.random() * categoryHints.length);
    return categoryHints[hintIndex];
  };

  // Speech feature handlers
  const handleToggleSpeech = () => {
    if (!speechSupported) {
      setQuizState(prev => ({
        ...prev,
        speechError: 'Trình duyệt không hỗ trợ tính năng giọng nói',
      }));
      return;
    }

    setQuizState(prev => {
      const newEnabled = !prev.speechEnabled;
      
      // Stop any ongoing speech when disabling
      if (!newEnabled) {
        stopSpeaking();
        stopListening();
      }
      
      return {
        ...prev,
        speechEnabled: newEnabled,
        voiceAnswerMode: false,
        speechError: null,
      };
    });
  };

  const handleReadQuestion = () => {
    if (!quizState.speechEnabled || !currentQuestion) return;
    
    // Stop any current speech
    stopSpeaking();
    
    // Read question text
    const questionText = `Câu hỏi: ${currentQuestion.question}`;
    speak(questionText, { lang: 'vi-VN', rate: 0.9 });
  };

  const handleReadAnswers = () => {
    if (!quizState.speechEnabled || !currentQuestion) return;
    
    // Stop any current speech
    stopSpeaking();
    
    // Read all answers in shuffled order
    const answersText = shuffledAnswerIndices
      .map((originalIndex, displayIndex) => `Đáp án ${displayIndex + 1}: ${currentQuestion.answers[originalIndex]}`)
      .join('. ');
    
    speak(answersText, { lang: 'vi-VN', rate: 0.9 });
  };

  const handleToggleVoiceAnswer = () => {
    if (!quizState.speechEnabled) return;
    
    setQuizState(prev => {
      const newVoiceMode = !prev.voiceAnswerMode;
      
      if (newVoiceMode) {
        // Start listening for voice answer
        startListening((result) => {
          if (result.isFinal) {
            handleVoiceAnswerResult(result.transcript);
          }
        }, {
          lang: 'vi-VN',
          continuous: false,
          interimResults: true,
        });
      } else {
        // Stop listening
        stopListening();
      }
      
      return {
        ...prev,
        voiceAnswerMode: newVoiceMode,
        speechError: null,
      };
    });
  };

  const handleVoiceAnswerResult = (transcript: string) => {
    if (!currentQuestion || quizState.showFeedback) return;
    
    const lowerTranscript = transcript.toLowerCase().trim();
    
    // Try to match answer by number (1, 2, 3, 4 or một, hai, ba, bốn)
    // Map spoken position to the original index via shuffled order
    const numberMap: Record<string, number> = {
      '1': 0, 'một': 0, 'mot': 0,
      '2': 1, 'hai': 1,
      '3': 2, 'ba': 2,
      '4': 3, 'bốn': 3, 'bon': 3,
    };
    
    for (const [key, position] of Object.entries(numberMap)) {
      if (lowerTranscript.includes(key)) {
        if (position < shuffledAnswerIndices.length) {
          const originalIndex = shuffledAnswerIndices[position];
          handleAnswerSelect(originalIndex);
          setTimeout(() => {
            handleAnswerSubmit(originalIndex);
          }, 500);
          stopListening();
          setQuizState(prev => ({ ...prev, voiceAnswerMode: false }));
          return;
        }
      }
    }
    
    // Try to match answer by content
    for (let i = 0; i < currentQuestion.answers.length; i++) {
      const answer = currentQuestion.answers[i].toLowerCase();
      if (answer.includes(lowerTranscript) || lowerTranscript.includes(answer)) {
        handleAnswerSelect(i);
        // Auto-submit after voice selection
        setTimeout(() => {
          handleAnswerSubmit(i);
        }, 500);
        stopListening();
        setQuizState(prev => ({ ...prev, voiceAnswerMode: false }));
        return;
      }
    }
    
    // No match found
    setQuizState(prev => ({
      ...prev,
      speechError: 'Không nhận diện được câu trả lời. Vui lòng thử lại.',
    }));
  };

  // Update speech error when hook error changes
  useEffect(() => {
    if (speechHookError && quizState.speechEnabled) {
      setQuizState(prev => ({
        ...prev,
        speechError: formatSpeechError(speechHookError),
      }));
    }
  }, [speechHookError, quizState.speechEnabled]);

  // Stop speech when component unmounts or question changes
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [quizState.currentQuestionIndex]);

  if (loading) {
    return <QuizModuleSkeleton />;
  }

  if (error) {
    return (
      <div className={cn('w-full max-w-4xl mx-auto p-6', className)}>
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Thử lại
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (quizState.quizCompleted) {
    const finalScore = score;
    const totalQuestions = quizState.questions.length;
    const percentage = Math.round((finalScore / totalQuestions) * 100);
    const isTrainingMode = quizState.currentMode === 'training';

    return (
      <div className={cn('w-full max-w-4xl mx-auto p-6', className)}>
        <Card>
          <CardHeader>
            <motion.h2 
              className="text-3xl font-bold text-white text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {isTrainingMode ? 'Hoàn thành luyện tập!' : 'Hoàn thành!'}
            </motion.h2>
          </CardHeader>
          <CardBody>
            <div className="text-center py-8">
              {isTrainingMode && (
                <motion.div
                  className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-blue-300 font-medium">
                    🎓 Chế độ luyện tập - Không tính điểm
                  </p>
                  <p className="text-sm text-blue-400 mt-1">
                    Bạn đã hoàn thành {totalQuestions} câu hỏi luyện tập
                  </p>
                </motion.div>
              )}
              
              <motion.div 
                className="mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2
                }}
              >
                <div className="text-6xl font-bold text-vietnam-500 mb-2">
                  {percentage}%
                </div>
                <p className="text-xl text-gray-300">
                  {finalScore} / {totalQuestions} câu đúng
                </p>
              </motion.div>

              <motion.div 
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {!isTrainingMode && percentage >= 80 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.7
                    }}
                  >
                    <p className="text-lg text-green-600 font-medium mb-2">
                      🎉 Xuất sắc! Bạn đã nắm vững kiến thức lịch sử!
                    </p>
                    <p className="text-sm text-gray-400">
                      +{finalScore * 20} điểm kinh nghiệm
                    </p>
                  </motion.div>
                )}
                {!isTrainingMode && percentage >= 60 && percentage < 80 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.7
                    }}
                  >
                    <p className="text-lg text-blue-400 font-medium mb-2">
                      👍 Tốt lắm! Tiếp tục học hỏi thêm nhé!
                    </p>
                    <p className="text-sm text-gray-400">
                      +{finalScore * 20} điểm kinh nghiệm
                    </p>
                  </motion.div>
                )}
                {!isTrainingMode && percentage < 60 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.7
                    }}
                  >
                    <p className="text-lg text-orange-600 font-medium mb-2">
                      💪 Cố gắng lên! Hãy thử lại để học thêm về lịch sử!
                    </p>
                    <p className="text-sm text-gray-400">
                      +{finalScore * 20} điểm kinh nghiệm
                    </p>
                  </motion.div>
                )}
                {isTrainingMode && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.7
                    }}
                  >
                    <p className="text-lg text-blue-400 font-medium mb-2">
                      {percentage >= 80 ? '🎉 Xuất sắc!' : percentage >= 60 ? '👍 Tốt lắm!' : '💪 Tiếp tục luyện tập!'}
                    </p>
                    <p className="text-sm text-gray-400">
                      Hãy thử chế độ thi thật để nhận phần thưởng!
                    </p>
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Button variant="primary" onClick={handleRestartQuiz}>
                  Làm lại
                </Button>
              </motion.div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const progress = ((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100;
  const isTrainingMode = quizState.currentMode === 'training';

  return (
    <div className={cn('w-full max-w-4xl mx-auto p-6', className)}>
      <Card>
        <CardHeader>
          {isTrainingMode && (
            <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-medium">🎓 Chế độ luyện tập</span>
                <span className="text-sm text-blue-400">
                  Không giới hạn thời gian • Không tính điểm • Có gợi ý
                </span>
              </div>
            </div>
          )}
          
          {/* Speech Controls */}
          {speechSupported && (
            <div className="mb-4 p-3 bg-purple-900/30 border border-purple-700 rounded-lg">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-medium">🎤 Tính năng giọng nói</span>
                  <button
                    onClick={handleToggleSpeech}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      quizState.speechEnabled ? 'bg-purple-600' : 'bg-gray-300'
                    )}
                    aria-label="Bật/tắt tính năng giọng nói"
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        quizState.speechEnabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
                
                {quizState.speechEnabled && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleReadQuestion}
                      disabled={speaking || !currentQuestion}
                      className="text-xs"
                    >
                      {speaking ? '🔊 Đang đọc...' : '📖 Đọc câu hỏi'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleReadAnswers}
                      disabled={speaking || !currentQuestion}
                      className="text-xs"
                    >
                      {speaking ? '🔊 Đang đọc...' : '📝 Đọc đáp án'}
                    </Button>
                    <Button
                      variant={quizState.voiceAnswerMode ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={handleToggleVoiceAnswer}
                      disabled={quizState.showFeedback}
                      className="text-xs"
                    >
                      {listening ? '🎤 Đang nghe...' : '🎤 Trả lời bằng giọng nói'}
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Speech Error Display */}
              {quizState.speechError && (
                <motion.div
                  className="mt-2 p-2 bg-red-900/30 border border-red-700 rounded text-sm text-red-400"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  ⚠️ {quizState.speechError}
                </motion.div>
              )}
              
              {/* Voice Answer Instructions */}
              {quizState.voiceAnswerMode && listening && (
                <motion.div
                  className="mt-2 p-2 bg-purple-100 border border-purple-300 rounded text-sm text-purple-300"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  💬 Nói số thứ tự (1, 2, 3, 4) hoặc nội dung câu trả lời
                </motion.div>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              Câu hỏi {quizState.currentQuestionIndex + 1} / {quizState.questions.length}
            </h2>
            <div className="flex items-center gap-4">
              {!isTrainingMode && (
                <>
                  <div className="text-sm text-gray-400">
                    Điểm: {score}
                  </div>
                  <div className={cn(
                    'text-sm font-medium px-3 py-1 rounded-full',
                    quizState.timeRemaining <= 10
                      ? 'bg-red-100 text-red-400'
                      : 'bg-gray-800 text-gray-300'
                  )}>
                    ⏱️ {quizState.timeRemaining}s
                  </div>
                </>
              )}
              {isTrainingMode && (
                <div className="text-sm text-gray-400">
                  Điểm: {score}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                isTrainingMode ? 'bg-blue-900/300' : 'bg-vietnam-500'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardHeader>

        <CardBody>
          {/* Question */}
          <div className="mb-6">
            <div className="flex items-start gap-2 mb-2">
              <span className={cn(
                'px-2 py-1 text-xs font-medium rounded',
                currentQuestion.difficulty === 'easy' && 'bg-green-100 text-green-700',
                currentQuestion.difficulty === 'medium' && 'bg-yellow-100 text-yellow-700',
                currentQuestion.difficulty === 'hard' && 'bg-red-100 text-red-400'
              )}>
                {currentQuestion.difficulty === 'easy' && 'Dễ'}
                {currentQuestion.difficulty === 'medium' && 'Trung bình'}
                {currentQuestion.difficulty === 'hard' && 'Khó'}
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-400">
                {currentQuestion.category === 'history' && 'Lịch sử'}
                {currentQuestion.category === 'strategy' && 'Chiến thuật'}
                {currentQuestion.category === 'culture' && 'Văn hóa'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Training Mode Hint */}
          {isTrainingMode && (
            <div className="mb-6">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleToggleHint}
                className="mb-3"
              >
                {quizState.showHint ? '🔒 Ẩn gợi ý' : '💡 Xem gợi ý'}
              </Button>
              
              <AnimatePresence>
                {quizState.showHint && (
                  <motion.div
                    className="p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <p className="font-medium text-yellow-300 mb-1">Gợi ý:</p>
                        <p className="text-yellow-400 text-sm leading-relaxed">
                          {getHintForQuestion(currentQuestion)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Answer Options */}
          <div className="space-y-3 mb-6">
            {shuffledAnswerIndices.map((originalIndex) => {
              const answer = currentQuestion.answers[originalIndex];
              const isSelected = quizState.selectedAnswer === originalIndex;
              const isCorrectAnswer = originalIndex === currentQuestion.correctAnswer;
              const showCorrect = quizState.showFeedback && isCorrectAnswer;
              const showIncorrect = quizState.showFeedback && isSelected && !isCorrectAnswer;

              return (
                <button
                  key={originalIndex}
                  onClick={() => handleAnswerSelect(originalIndex)}
                  disabled={quizState.showFeedback}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border-2 transition-all duration-200',
                    'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2',
                    !quizState.showFeedback && 'hover:border-vietnam-400',
                    isSelected && !quizState.showFeedback && 'border-vietnam-500 bg-vietnam-50',
                    !isSelected && !quizState.showFeedback && 'border-gray-300 bg-white',
                    showCorrect && 'border-green-500 bg-green-50',
                    showIncorrect && 'border-red-500 bg-red-900/30',
                    quizState.showFeedback && !showCorrect && !showIncorrect && 'border-gray-300 bg-gray-50 opacity-60'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-black font-medium">{answer}</span>
                    {showCorrect && (
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {showIncorrect && (
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback and Explanation */}
          <AnimatePresence>
            {quizState.showFeedback && (
              <motion.div 
                className={cn(
                  'p-4 rounded-lg mb-6',
                  quizState.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-900/30 border border-red-700'
                )}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start gap-3">
                  {quizState.isCorrect ? (
                    <motion.svg 
                      className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.1
                      }}
                    >
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </motion.svg>
                  ) : (
                    <motion.svg 
                      className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.1
                      }}
                    >
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </motion.svg>
                  )}
                  <div>
                    <motion.p 
                      className={cn(
                        'font-bold mb-2',
                        quizState.isCorrect ? 'text-green-900' : 'text-red-900'
                      )}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {quizState.isCorrect ? '✨ Chính xác!' : '❌ Chưa đúng!'}
                    </motion.p>
                    <motion.p 
                      className="text-gray-300 leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {currentQuestion.explanation}
                    </motion.p>
                    {quizState.isCorrect && !isTrainingMode && (
                      <motion.p 
                        className="text-sm text-green-700 mt-2 font-medium"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        🎁 +{currentQuestion.difficulty === 'hard' ? 100 : currentQuestion.difficulty === 'medium' ? 75 : 50} vàng
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            {!quizState.showFeedback ? (
              <Button
                variant="primary"
                onClick={() => handleAnswerSubmit(quizState.selectedAnswer)}
                disabled={quizState.selectedAnswer === null}
              >
                Trả lời
              </Button>
            ) : (
              <Button variant="primary" onClick={handleNextQuestion}>
                {quizState.currentQuestionIndex < quizState.questions.length - 1
                  ? 'Câu tiếp theo'
                  : 'Hoàn thành'}
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
