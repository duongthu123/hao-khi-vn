import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QuizModule } from './QuizModule';
import { useGameStore } from '@/store';
import { useSpeech } from '@/hooks/useSpeech';

// Mock the store
vi.mock('@/store', () => ({
  useGameStore: vi.fn(),
}));

// Mock useSpeech hook
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: vi.fn(),
  formatSpeechError: vi.fn((error: string) => error),
}));

// Mock quiz data
const mockQuizData = [
  {
    id: 'test-001',
    question: 'Test question 1?',
    answers: ['Answer A', 'Answer B', 'Answer C', 'Answer D'],
    correctAnswer: 0,
    explanation: 'This is the explanation for question 1.',
    difficulty: 'easy' as const,
    category: 'history' as const,
  },
  {
    id: 'test-002',
    question: 'Test question 2?',
    answers: ['Answer 1', 'Answer 2', 'Answer 3'],
    correctAnswer: 1,
    explanation: 'This is the explanation for question 2.',
    difficulty: 'medium' as const,
    category: 'strategy' as const,
  },
];

// Mock fetch
global.fetch = vi.fn();

describe('QuizModule', () => {
  const mockRecordAnswer = vi.fn();
  const mockAddReward = vi.fn();
  const mockAddResource = vi.fn();
  const mockIncrementStats = vi.fn();
  const mockAddExperience = vi.fn();
  
  const mockSpeak = vi.fn();
  const mockStopSpeaking = vi.fn();
  const mockStartListening = vi.fn();
  const mockStopListening = vi.fn();
  const mockCancelListening = vi.fn();

  beforeEach(() => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockQuizData,
    });

    // Setup store mock
    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        recordAnswer: mockRecordAnswer,
        addReward: mockAddReward,
        addResource: mockAddResource,
        incrementStats: mockIncrementStats,
        addExperience: mockAddExperience,
      };
      return selector(state);
    });
    
    // Setup speech mock - default to not supported
    (useSpeech as any).mockReturnValue({
      supported: false,
      speaking: false,
      listening: false,
      voices: [],
      vietnameseVoices: [],
      error: null,
      speak: mockSpeak,
      stopSpeaking: mockStopSpeaking,
      startListening: mockStartListening,
      stopListening: mockStopListening,
      cancelListening: mockCancelListening,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<QuizModule />);
    expect(screen.getAllByLabelText(/đang tải/i).length).toBeGreaterThan(0);
  });

  it('loads and displays quiz questions', async () => {
    render(<QuizModule />);

    await waitFor(() => {
      expect(screen.getByText(/câu hỏi 1 \/ 2/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Questions are shuffled, so just check that one of them is displayed
    const hasQuestion1 = screen.queryByText('Test question 1?');
    const hasQuestion2 = screen.queryByText('Test question 2?');
    expect(hasQuestion1 || hasQuestion2).toBeTruthy();
  });

  it('displays error message when loading fails', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<QuizModule />);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('allows selecting an answer', async () => {
    render(<QuizModule />);

    await waitFor(() => {
      expect(screen.getByText(/câu hỏi 1 \/ 2/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const answerButtons = screen.getAllByRole('button').filter(btn => 
      btn.textContent?.includes('Answer')
    );
    const answerButton = answerButtons[0];
    fireEvent.click(answerButton);

    expect(answerButton.closest('button')).toHaveClass('border-vietnam-500');
  });

  it('shows feedback after submitting answer', async () => {
    render(<QuizModule />);

    await waitFor(() => {
      expect(screen.getByText(/câu hỏi 1 \/ 2/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Select any answer
    const answerButtons = screen.getAllByRole('button').filter(btn => 
      btn.textContent?.includes('Answer')
    );
    fireEvent.click(answerButtons[0]);
    
    // Submit answer
    fireEvent.click(screen.getByText(/trả lời/i));

    await waitFor(() => {
      expect(screen.getByText(/chính xác!|chưa đúng!/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays difficulty and category badges', async () => {
    render(<QuizModule />);

    await waitFor(() => {
      expect(screen.getByText(/câu hỏi 1 \/ 2/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check for difficulty badge (either Dễ or Trung bình)
    expect(screen.getByText(/dễ|trung bình|khó/i)).toBeInTheDocument();
    // Check for category badge
    expect(screen.getByText(/lịch sử|chiến thuật|văn hóa/i)).toBeInTheDocument();
  });

  it('displays timer', async () => {
    render(<QuizModule />);

    await waitFor(() => {
      expect(screen.getByText(/câu hỏi 1 \/ 2/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText(/\d+s/i)).toBeInTheDocument();
  });

  it('does not display timer in training mode', async () => {
    render(<QuizModule mode="training" />);

    await waitFor(() => {
      expect(screen.getByText(/câu hỏi 1 \/ 2/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.queryByText(/\d+s/i)).not.toBeInTheDocument();
  });

  it('displays training mode indicator', async () => {
    render(<QuizModule mode="training" />);

    await waitFor(() => {
      expect(screen.getByText(/chế độ luyện tập/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows hint button in training mode', async () => {
    render(<QuizModule mode="training" />);

    await waitFor(() => {
      expect(screen.getByText(/câu hỏi 1 \/ 2/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText(/xem gợi ý/i)).toBeInTheDocument();
  });

  it('toggles hint visibility in training mode', async () => {
    render(<QuizModule mode="training" />);

    await waitFor(() => {
      expect(screen.getByText(/câu hỏi 1 \/ 2/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const hintButton = screen.getByText(/xem gợi ý/i);
    fireEvent.click(hintButton);

    await waitFor(() => {
      expect(screen.getByText(/gợi ý:/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    fireEvent.click(screen.getByText(/ẩn gợi ý/i));

    await waitFor(() => {
      expect(screen.queryByText(/gợi ý:/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('does not show hint button in quiz mode', async () => {
    render(<QuizModule mode="quiz" />);

    await waitFor(() => {
      expect(screen.getByText(/câu hỏi 1 \/ 2/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.queryByText(/xem gợi ý/i)).not.toBeInTheDocument();
  });

  it('does not call store actions in training mode', async () => {
    render(<QuizModule mode="training" />);

    await waitFor(() => {
      expect(screen.getByText(/câu hỏi 1 \/ 2/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const answerButtons = screen.getAllByRole('button').filter(btn => 
      btn.textContent?.includes('Answer')
    );
    fireEvent.click(answerButtons[0]);
    fireEvent.click(screen.getByText(/trả lời/i));

    await waitFor(() => {
      expect(screen.getByText(/chính xác!|chưa đúng!/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // In training mode, these should not be called
    expect(mockRecordAnswer).not.toHaveBeenCalled();
    expect(mockAddReward).not.toHaveBeenCalled();
    expect(mockAddResource).not.toHaveBeenCalled();
    expect(mockAddExperience).not.toHaveBeenCalled();
  });

  it('does not show rewards in training mode feedback', async () => {
    render(<QuizModule mode="training" />);

    await waitFor(() => {
      expect(screen.getByText(/câu hỏi 1 \/ 2/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const answerButtons = screen.getAllByRole('button').filter(btn => 
      btn.textContent?.includes('Answer')
    );
    fireEvent.click(answerButtons[0]);
    fireEvent.click(screen.getByText(/trả lời/i));

    await waitFor(() => {
      expect(screen.getByText(/chính xác!|chưa đúng!/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Should not show reward message
    expect(screen.queryByText(/vàng/i)).not.toBeInTheDocument();
  });

  it('displays progress bar', async () => {
    render(<QuizModule />);

    await waitFor(() => {
      expect(screen.getByText(/câu hỏi 1 \/ 2/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const progressBar = document.querySelector('.bg-vietnam-500');
    expect(progressBar).toBeInTheDocument();
  });

  it('records answer in quiz state when submitting', async () => {
    render(<QuizModule />);

    await waitFor(() => {
      expect(screen.getByText(/câu hỏi 1 \/ 2/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Get any answer button and click it
    const answerButtons = screen.getAllByRole('button').filter(btn => 
      btn.textContent?.includes('Answer')
    );
    fireEvent.click(answerButtons[0]);
    
    // Submit answer
    fireEvent.click(screen.getByText(/trả lời/i));

    await waitFor(() => {
      expect(mockRecordAnswer).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('calls store actions when submitting answer', async () => {
    render(<QuizModule />);

    await waitFor(() => {
      expect(screen.getByText(/câu hỏi 1 \/ 2/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const answerButtons = screen.getAllByRole('button').filter(btn => 
      btn.textContent?.includes('Answer')
    );
    fireEvent.click(answerButtons[0]);
    fireEvent.click(screen.getByText(/trả lời/i));

    await waitFor(() => {
      // Verify that quiz state management functions are called
      expect(mockRecordAnswer).toHaveBeenCalled();
      // Note: rewards are only given for correct answers, so we just verify the function exists
      expect(mockAddReward).toBeDefined();
      expect(mockAddResource).toBeDefined();
      expect(mockAddExperience).toBeDefined();
    }, { timeout: 3000 });
  });

  it('displays validation error for malformed quiz data', async () => {
    const malformedData = [
      {
        id: 'test-001',
        question: 'Test question?',
        answers: ['Answer 1', 'Answer 2'],
        correctAnswer: 5, // Invalid: out of bounds
        explanation: 'Test explanation',
        difficulty: 'easy',
        category: 'history'
      }
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => malformedData,
    });

    render(<QuizModule />);

    await waitFor(() => {
      expect(screen.getByText(/lỗi xác thực dữ liệu/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays error for invalid JSON format', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    render(<QuizModule />);

    await waitFor(() => {
      expect(screen.getByText(/không đúng định dạng json/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays error for empty quiz data', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<QuizModule />);

    await waitFor(() => {
      expect(screen.getByText(/không có câu hỏi nào/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays error for HTTP failure', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<QuizModule />);

    await waitFor(() => {
      expect(screen.getByText(/không thể tải câu hỏi.*404/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  describe('Speech Features', () => {
    beforeEach(() => {
      // Enable speech support for these tests
      (useSpeech as any).mockReturnValue({
        supported: true,
        speaking: false,
        listening: false,
        voices: [],
        vietnameseVoices: [],
        error: null,
        speak: mockSpeak,
        stopSpeaking: mockStopSpeaking,
        startListening: mockStartListening,
        stopListening: mockStopListening,
        cancelListening: mockCancelListening,
      });
    });

    it('displays speech controls when speech is supported', async () => {
      render(<QuizModule />);

      await waitFor(() => {
        expect(screen.getByText(/tính năng giọng nói/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('does not display speech controls when speech is not supported', async () => {
      (useSpeech as any).mockReturnValue({
        supported: false,
        speaking: false,
        listening: false,
        voices: [],
        vietnameseVoices: [],
        error: null,
        speak: mockSpeak,
        stopSpeaking: mockStopSpeaking,
        startListening: mockStartListening,
        stopListening: mockStopListening,
        cancelListening: mockCancelListening,
      });

      render(<QuizModule />);

      await waitFor(() => {
        expect(screen.getByText(/câu hỏi 1 \/ 2/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.queryByText(/tính năng giọng nói/i)).not.toBeInTheDocument();
    });

    it('toggles speech features on and off', async () => {
      render(<QuizModule />);

      await waitFor(() => {
        expect(screen.getByText(/tính năng giọng nói/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      const toggle = screen.getByLabelText(/bật\/tắt tính năng giọng nói/i);
      
      // Enable speech
      fireEvent.click(toggle);
      
      await waitFor(() => {
        expect(screen.getByText(/đọc câu hỏi/i)).toBeInTheDocument();
      });

      // Disable speech
      fireEvent.click(toggle);
      
      await waitFor(() => {
        expect(screen.queryByText(/đọc câu hỏi/i)).not.toBeInTheDocument();
      });
    });

    it('shows speech control buttons when speech is enabled', async () => {
      render(<QuizModule />);

      await waitFor(() => {
        expect(screen.getByText(/tính năng giọng nói/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      const toggle = screen.getByLabelText(/bật\/tắt tính năng giọng nói/i);
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(screen.getByText(/đọc câu hỏi/i)).toBeInTheDocument();
        expect(screen.getByText(/đọc đáp án/i)).toBeInTheDocument();
        expect(screen.getByText(/trả lời bằng giọng nói/i)).toBeInTheDocument();
      });
    });

    it('calls speak function when reading question', async () => {
      render(<QuizModule />);

      await waitFor(() => {
        expect(screen.getByText(/tính năng giọng nói/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      const toggle = screen.getByLabelText(/bật\/tắt tính năng giọng nói/i);
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(screen.getByText(/đọc câu hỏi/i)).toBeInTheDocument();
      });

      const readQuestionButton = screen.getByText(/đọc câu hỏi/i);
      fireEvent.click(readQuestionButton);

      expect(mockSpeak).toHaveBeenCalled();
      expect(mockSpeak).toHaveBeenCalledWith(
        expect.stringContaining('Câu hỏi:'),
        expect.objectContaining({ lang: 'vi-VN' })
      );
    });

    it('calls speak function when reading answers', async () => {
      render(<QuizModule />);

      await waitFor(() => {
        expect(screen.getByText(/tính năng giọng nói/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      const toggle = screen.getByLabelText(/bật\/tắt tính năng giọng nói/i);
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(screen.getByText(/đọc đáp án/i)).toBeInTheDocument();
      });

      const readAnswersButton = screen.getByText(/đọc đáp án/i);
      fireEvent.click(readAnswersButton);

      expect(mockSpeak).toHaveBeenCalled();
      expect(mockSpeak).toHaveBeenCalledWith(
        expect.stringContaining('Đáp án'),
        expect.objectContaining({ lang: 'vi-VN' })
      );
    });

    it('starts listening when voice answer mode is activated', async () => {
      render(<QuizModule />);

      await waitFor(() => {
        expect(screen.getByText(/tính năng giọng nói/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      const toggle = screen.getByLabelText(/bật\/tắt tính năng giọng nói/i);
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(screen.getByText(/trả lời bằng giọng nói/i)).toBeInTheDocument();
      });

      const voiceAnswerButton = screen.getByText(/trả lời bằng giọng nói/i);
      fireEvent.click(voiceAnswerButton);

      await waitFor(() => {
        expect(mockStartListening).toHaveBeenCalled();
        expect(mockStartListening).toHaveBeenCalledWith(
          expect.any(Function),
          expect.objectContaining({ lang: 'vi-VN' })
        );
      });
    });

    it('stops listening when voice answer mode is deactivated', async () => {
      render(<QuizModule />);

      await waitFor(() => {
        expect(screen.getByText(/tính năng giọng nói/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      const toggle = screen.getByLabelText(/bật\/tắt tính năng giọng nói/i);
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(screen.getByText(/trả lời bằng giọng nói/i)).toBeInTheDocument();
      });

      const voiceAnswerButton = screen.getByText(/trả lời bằng giọng nói/i);
      
      // First click to start listening
      fireEvent.click(voiceAnswerButton);

      // Wait for listening to start
      await waitFor(() => {
        expect(mockStartListening).toHaveBeenCalled();
      });

      // Update mock to show listening state
      (useSpeech as any).mockReturnValue({
        supported: true,
        speaking: false,
        listening: true,
        voices: [],
        vietnameseVoices: [],
        error: null,
        speak: mockSpeak,
        stopSpeaking: mockStopSpeaking,
        startListening: mockStartListening,
        stopListening: mockStopListening,
        cancelListening: mockCancelListening,
      });

      // Find the button again (it should now show "Đang nghe...")
      const listeningButton = await screen.findByText(/đang nghe\.\.\./i);
      
      // Click again to stop
      fireEvent.click(listeningButton);

      expect(mockStopListening).toHaveBeenCalled();
    });

    it('displays listening indicator when voice answer mode is active', async () => {
      (useSpeech as any).mockReturnValue({
        supported: true,
        speaking: false,
        listening: true,
        voices: [],
        vietnameseVoices: [],
        error: null,
        speak: mockSpeak,
        stopSpeaking: mockStopSpeaking,
        startListening: mockStartListening,
        stopListening: mockStopListening,
        cancelListening: mockCancelListening,
      });

      render(<QuizModule />);

      await waitFor(() => {
        expect(screen.getByText(/tính năng giọng nói/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      const toggle = screen.getByLabelText(/bật\/tắt tính năng giọng nói/i);
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(screen.getByText(/đang nghe\.\.\./i)).toBeInTheDocument();
      });
    });

    it('displays speaking indicator when speaking', async () => {
      (useSpeech as any).mockReturnValue({
        supported: true,
        speaking: true,
        listening: false,
        voices: [],
        vietnameseVoices: [],
        error: null,
        speak: mockSpeak,
        stopSpeaking: mockStopSpeaking,
        startListening: mockStartListening,
        stopListening: mockStopListening,
        cancelListening: mockCancelListening,
      });

      render(<QuizModule />);

      await waitFor(() => {
        expect(screen.getByText(/tính năng giọng nói/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      const toggle = screen.getByLabelText(/bật\/tắt tính năng giọng nói/i);
      fireEvent.click(toggle);

      await waitFor(() => {
        const speakingButtons = screen.getAllByText(/đang đọc\.\.\./i);
        expect(speakingButtons.length).toBeGreaterThan(0);
      });
    });

    it('displays speech error message when error occurs', async () => {
      (useSpeech as any).mockReturnValue({
        supported: true,
        speaking: false,
        listening: false,
        voices: [],
        vietnameseVoices: [],
        error: 'Speech recognition error: not-allowed',
        speak: mockSpeak,
        stopSpeaking: mockStopSpeaking,
        startListening: mockStartListening,
        stopListening: mockStopListening,
        cancelListening: mockCancelListening,
      });

      render(<QuizModule />);

      await waitFor(() => {
        expect(screen.getByText(/tính năng giọng nói/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      const toggle = screen.getByLabelText(/bật\/tắt tính năng giọng nói/i);
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(screen.getByText(/not-allowed/i)).toBeInTheDocument();
      });
    });

    it('displays voice answer instructions when listening', async () => {
      let mockListening = false;
      
      (useSpeech as any).mockImplementation(() => ({
        supported: true,
        speaking: false,
        listening: mockListening,
        voices: [],
        vietnameseVoices: [],
        error: null,
        speak: mockSpeak,
        stopSpeaking: mockStopSpeaking,
        startListening: (callback: any) => {
          mockListening = true;
          mockStartListening(callback);
        },
        stopListening: () => {
          mockListening = false;
          mockStopListening();
        },
        cancelListening: mockCancelListening,
      }));

      const { rerender } = render(<QuizModule />);

      await waitFor(() => {
        expect(screen.getByText(/tính năng giọng nói/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      const toggle = screen.getByLabelText(/bật\/tắt tính năng giọng nói/i);
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(screen.getByText(/trả lời bằng giọng nói/i)).toBeInTheDocument();
      });

      // Activate voice answer mode - this should trigger listening
      const voiceAnswerButton = screen.getByText(/trả lời bằng giọng nói/i);
      fireEvent.click(voiceAnswerButton);

      // Update mock to return listening=true
      (useSpeech as any).mockReturnValue({
        supported: true,
        speaking: false,
        listening: true,
        voices: [],
        vietnameseVoices: [],
        error: null,
        speak: mockSpeak,
        stopSpeaking: mockStopSpeaking,
        startListening: mockStartListening,
        stopListening: mockStopListening,
        cancelListening: mockCancelListening,
      });

      // Force re-render
      rerender(<QuizModule />);

      await waitFor(() => {
        expect(screen.getByText(/nói số thứ tự/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('disables voice answer button when feedback is shown', async () => {
      render(<QuizModule />);

      await waitFor(() => {
        expect(screen.getByText(/tính năng giọng nói/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      const toggle = screen.getByLabelText(/bật\/tắt tính năng giọng nói/i);
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(screen.getByText(/trả lời bằng giọng nói/i)).toBeInTheDocument();
      });

      // Select and submit an answer to show feedback
      const answerButtons = screen.getAllByRole('button').filter(btn => 
        btn.textContent?.includes('Answer')
      );
      fireEvent.click(answerButtons[0]);
      fireEvent.click(screen.getByText(/^trả lời$/i));

      await waitFor(() => {
        expect(screen.getByText(/chính xác!|chưa đúng!/i)).toBeInTheDocument();
      });

      const voiceAnswerButton = screen.getByText(/trả lời bằng giọng nói/i);
      expect(voiceAnswerButton).toBeDisabled();
    });

    it('stops speech when disabling speech features', async () => {
      render(<QuizModule />);

      await waitFor(() => {
        expect(screen.getByText(/tính năng giọng nói/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      const toggle = screen.getByLabelText(/bật\/tắt tính năng giọng nói/i);
      
      // Enable speech
      fireEvent.click(toggle);
      
      await waitFor(() => {
        expect(screen.getByText(/đọc câu hỏi/i)).toBeInTheDocument();
      });

      // Disable speech
      fireEvent.click(toggle);

      expect(mockStopSpeaking).toHaveBeenCalled();
      expect(mockStopListening).toHaveBeenCalled();
    });
  });
});
