/**
 * Web Speech API Hook
 * Provides speech synthesis and recognition for Vietnamese language
 * Validates Requirements 28.1, 28.2, 28.3, 28.4, 28.5
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Speech synthesis options
 */
export interface SpeechSynthesisOptions {
  /**
   * Language code (default: 'vi-VN' for Vietnamese)
   */
  lang?: string;
  
  /**
   * Speech rate (0.1 to 10, default: 1)
   */
  rate?: number;
  
  /**
   * Speech pitch (0 to 2, default: 1)
   */
  pitch?: number;
  
  /**
   * Speech volume (0 to 1, default: 1)
   */
  volume?: number;
  
  /**
   * Voice to use (optional, will use default Vietnamese voice if available)
   */
  voice?: SpeechSynthesisVoice | null;
}

/**
 * Speech recognition options
 */
export interface SpeechRecognitionOptions {
  /**
   * Language code (default: 'vi-VN' for Vietnamese)
   */
  lang?: string;
  
  /**
   * Whether to return continuous results
   */
  continuous?: boolean;
  
  /**
   * Whether to return interim results
   */
  interimResults?: boolean;
  
  /**
   * Maximum number of alternative transcriptions
   */
  maxAlternatives?: number;
}

/**
 * Speech recognition result
 */
export interface SpeechRecognitionResult {
  /**
   * Transcribed text
   */
  transcript: string;
  
  /**
   * Confidence score (0 to 1)
   */
  confidence: number;
  
  /**
   * Whether this is a final result
   */
  isFinal: boolean;
}

/**
 * Speech hook return type
 */
export interface UseSpeechReturn {
  /**
   * Whether Web Speech API is supported in this browser
   */
  supported: boolean;
  
  /**
   * Whether speech synthesis is currently speaking
   */
  speaking: boolean;
  
  /**
   * Whether speech recognition is currently listening
   */
  listening: boolean;
  
  /**
   * Available voices for speech synthesis
   */
  voices: SpeechSynthesisVoice[];
  
  /**
   * Vietnamese voices (filtered from available voices)
   */
  vietnameseVoices: SpeechSynthesisVoice[];
  
  /**
   * Last error that occurred
   */
  error: string | null;
  
  /**
   * Speak text using speech synthesis
   */
  speak: (text: string, options?: SpeechSynthesisOptions) => void;
  
  /**
   * Stop current speech synthesis
   */
  stopSpeaking: () => void;
  
  /**
   * Start speech recognition
   */
  startListening: (
    onResult: (result: SpeechRecognitionResult) => void,
    options?: SpeechRecognitionOptions
  ) => void;
  
  /**
   * Stop speech recognition
   */
  stopListening: () => void;
  
  /**
   * Cancel speech recognition
   */
  cancelListening: () => void;
}

/**
 * Check if Web Speech API is supported
 */
function checkSpeechSupport(): {
  synthesis: boolean;
  recognition: boolean;
} {
  const synthesis = 'speechSynthesis' in window;
  const recognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  
  return { synthesis, recognition };
}

/**
 * Get SpeechRecognition constructor (handles webkit prefix)
 */
function getSpeechRecognition(): typeof SpeechRecognition | null {
  if ('SpeechRecognition' in window) {
    return window.SpeechRecognition;
  }
  if ('webkitSpeechRecognition' in window) {
    return (window as any).webkitSpeechRecognition;
  }
  return null;
}

/**
 * Custom hook for Web Speech API integration
 * 
 * Provides speech synthesis (text-to-speech) and speech recognition (speech-to-text)
 * with support for Vietnamese language. Gracefully degrades when Web Speech API
 * is not supported.
 * 
 * Features:
 * - Browser support detection
 * - Vietnamese language support
 * - Speech synthesis with configurable voice, rate, pitch, volume
 * - Speech recognition with confidence scores
 * - Error handling
 * - Automatic cleanup
 * 
 * @example
 * ```tsx
 * const { supported, speak, startListening, stopListening } = useSpeech();
 * 
 * if (supported) {
 *   // Speak Vietnamese text
 *   speak('Xin chào', { lang: 'vi-VN' });
 *   
 *   // Listen for Vietnamese speech
 *   startListening((result) => {
 *     console.log('Heard:', result.transcript);
 *   }, { lang: 'vi-VN' });
 * }
 * ```
 */
export function useSpeech(): UseSpeechReturn {
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [vietnameseVoices, setVietnameseVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Check support
  const support = checkSpeechSupport();
  const supported = support.synthesis || support.recognition;
  
  // Load available voices
  useEffect(() => {
    if (!support.synthesis) return;
    
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Filter Vietnamese voices
      const viVoices = availableVoices.filter(
        voice => voice.lang.startsWith('vi') || voice.lang.startsWith('VI')
      );
      setVietnameseVoices(viVoices);
    };
    
    // Load voices immediately
    loadVoices();
    
    // Some browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (support.synthesis && window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [support.synthesis]);
  
  /**
   * Speak text using speech synthesis
   */
  const speak = useCallback((text: string, options: SpeechSynthesisOptions = {}) => {
    if (!support.synthesis) {
      setError('Speech synthesis is not supported in this browser');
      return;
    }
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    // Set options
    utterance.lang = options.lang || 'vi-VN';
    utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;
    
    // Set voice if specified, otherwise try to use Vietnamese voice
    if (options.voice) {
      utterance.voice = options.voice;
    } else if (vietnameseVoices.length > 0) {
      utterance.voice = vietnameseVoices[0];
    }
    
    // Event handlers
    utterance.onstart = () => {
      setSpeaking(true);
      setError(null);
    };
    
    utterance.onend = () => {
      setSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      setSpeaking(false);
      setError(`Speech synthesis error: ${event.error}`);
    };
    
    // Speak
    window.speechSynthesis.speak(utterance);
  }, [support.synthesis, vietnameseVoices]);
  
  /**
   * Stop current speech synthesis
   */
  const stopSpeaking = useCallback(() => {
    if (!support.synthesis) return;
    
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [support.synthesis]);
  
  /**
   * Start speech recognition
   */
  const startListening = useCallback((
    onResult: (result: SpeechRecognitionResult) => void,
    options: SpeechRecognitionOptions = {}
  ) => {
    if (!support.recognition) {
      setError('Speech recognition is not supported in this browser');
      return;
    }
    
    const SpeechRecognitionConstructor = getSpeechRecognition();
    if (!SpeechRecognitionConstructor) {
      setError('Speech recognition constructor not available');
      return;
    }
    
    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Create recognition instance
    const recognition = new SpeechRecognitionConstructor();
    recognitionRef.current = recognition;
    
    // Set options
    recognition.lang = options.lang || 'vi-VN';
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = options.interimResults ?? true;
    recognition.maxAlternatives = options.maxAlternatives ?? 1;
    
    // Event handlers
    recognition.onstart = () => {
      setListening(true);
      setError(null);
    };
    
    recognition.onresult = (event) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      const alternative = lastResult[0];
      
      onResult({
        transcript: alternative.transcript,
        confidence: alternative.confidence,
        isFinal: lastResult.isFinal,
      });
    };
    
    recognition.onerror = (event) => {
      setListening(false);
      
      // Don't treat 'no-speech' as an error
      if (event.error === 'no-speech') {
        return;
      }
      
      // Don't treat 'aborted' as an error (user cancelled)
      if (event.error === 'aborted') {
        return;
      }
      
      setError(`Speech recognition error: ${event.error}`);
    };
    
    recognition.onend = () => {
      setListening(false);
    };
    
    // Start recognition
    try {
      recognition.start();
    } catch (err) {
      setListening(false);
      setError(`Failed to start speech recognition: ${err}`);
    }
  }, [support.recognition]);
  
  /**
   * Stop speech recognition
   */
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
    } catch (err) {
      // Ignore errors when stopping
    }
  }, []);
  
  /**
   * Cancel speech recognition
   */
  const cancelListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.abort();
    } catch (err) {
      // Ignore errors when cancelling
    }
    
    setListening(false);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop speech synthesis
      if (support.synthesis && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      // Stop speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          // Ignore errors during cleanup
        }
      }
    };
  }, [support.synthesis]);
  
  return {
    supported,
    speaking,
    listening,
    voices,
    vietnameseVoices,
    error,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    cancelListening,
  };
}

/**
 * Get the best Vietnamese voice from available voices
 */
export function getBestVietnameseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const vietnameseVoices = voices.filter(
    voice => voice.lang.startsWith('vi') || voice.lang.startsWith('VI')
  );
  
  if (vietnameseVoices.length === 0) return null;
  
  // Prefer local voices over remote
  const localVoice = vietnameseVoices.find(voice => voice.localService);
  if (localVoice) return localVoice;
  
  // Return first Vietnamese voice
  return vietnameseVoices[0];
}

/**
 * Format speech recognition error for display
 */
export function formatSpeechError(error: string): string {
  const errorMap: Record<string, string> = {
    'no-speech': 'Không phát hiện giọng nói',
    'audio-capture': 'Không thể truy cập microphone',
    'not-allowed': 'Quyền truy cập microphone bị từ chối',
    'network': 'Lỗi kết nối mạng',
    'aborted': 'Đã hủy',
    'language-not-supported': 'Ngôn ngữ không được hỗ trợ',
    'service-not-allowed': 'Dịch vụ không được phép',
  };
  
  // Extract error type from error message
  for (const [key, message] of Object.entries(errorMap)) {
    if (error.includes(key)) {
      return message;
    }
  }
  
  return error;
}
