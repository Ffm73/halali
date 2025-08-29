import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VoiceRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  sensitivity: number;
  noiseReduction: boolean;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: string[];
}

export function useVoiceRecognition() {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [config, setConfig] = useState<VoiceRecognitionConfig>({
    language: 'ar-SA',
    continuous: false,
    interimResults: true,
    maxAlternatives: 3,
    sensitivity: 0.7,
    noiseReduction: true,
  });
  
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeVoiceRecognition();
    loadConfig();
  }, []);

  const initializeVoiceRecognition = () => {
    if (Platform.OS === 'web') {
      // Web Speech API support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        setIsAvailable(true);
        
        recognitionRef.current = new SpeechRecognition();
        setupWebSpeechRecognition();
      } else {
        console.log('🎤 Speech recognition not supported on this browser');
        setIsSupported(false);
      }
    } else {
      // For React Native, you would use expo-speech or react-native-voice
      // For now, we'll simulate support
      setIsSupported(true);
      setIsAvailable(true);
      console.log('🎤 Voice recognition initialized for mobile');
    }
  };

  const setupWebSpeechRecognition = () => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    
    recognition.continuous = config.continuous;
    recognition.interimResults = config.interimResults;
    recognition.maxAlternatives = config.maxAlternatives;
    recognition.lang = config.language;

    recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      setIsListening(true);
    };

    recognition.onend = () => {
      console.log('🎤 Voice recognition ended');
      setIsListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('🎤 Voice recognition error:', event.error);
      setIsListening(false);
      
      let errorMessage = 'Voice recognition error';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture failed';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied';
          break;
        case 'network':
          errorMessage = 'Network error';
          break;
        default:
          errorMessage = `Voice recognition error: ${event.error}`;
      }
      
      // Call error handler if provided
      if (onErrorCallback.current) {
        onErrorCallback.current(errorMessage);
      }
    };

    recognition.onresult = (event: any) => {
      const results: VoiceRecognitionResult[] = [];
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        const isFinal = result.isFinal;
        
        const alternatives = [];
        for (let j = 1; j < result.length; j++) {
          alternatives.push(result[j].transcript);
        }

        results.push({
          transcript: transcript.trim(),
          confidence,
          isFinal,
          alternatives,
        });
      }

      // Call result handler if provided
      if (onResultCallback.current && results.length > 0) {
        onResultCallback.current(results);
      }
    };
  };

  const onResultCallback = useRef<((results: VoiceRecognitionResult[]) => void) | null>(null);
  const onErrorCallback = useRef<((error: string) => void) | null>(null);

  const loadConfig = async () => {
    try {
      const stored = await AsyncStorage.getItem('voiceRecognitionConfig');
      if (stored) {
        const loadedConfig = JSON.parse(stored);
        setConfig(loadedConfig);
        
        // Update recognition settings if available
        if (recognitionRef.current) {
          recognitionRef.current.lang = loadedConfig.language;
          recognitionRef.current.continuous = loadedConfig.continuous;
          recognitionRef.current.interimResults = loadedConfig.interimResults;
          recognitionRef.current.maxAlternatives = loadedConfig.maxAlternatives;
        }
      }
    } catch (error) {
      console.error('Failed to load voice recognition config:', error);
    }
  };

  const saveConfig = async (newConfig: VoiceRecognitionConfig) => {
    try {
      await AsyncStorage.setItem('voiceRecognitionConfig', JSON.stringify(newConfig));
      setConfig(newConfig);
      
      // Update recognition settings
      if (recognitionRef.current) {
        recognitionRef.current.lang = newConfig.language;
        recognitionRef.current.continuous = newConfig.continuous;
        recognitionRef.current.interimResults = newConfig.interimResults;
        recognitionRef.current.maxAlternatives = newConfig.maxAlternatives;
      }
      
      console.log('✅ Voice recognition config saved');
    } catch (error) {
      console.error('Failed to save voice recognition config:', error);
    }
  };

  const startListening = (
    onResult: (results: VoiceRecognitionResult[]) => void,
    onError?: (error: string) => void,
    options?: Partial<VoiceRecognitionConfig>
  ) => {
    if (!isSupported || !isAvailable) {
      onError?.('Voice recognition not available');
      return false;
    }

    if (isListening) {
      console.log('🎤 Already listening');
      return false;
    }

    // Set callbacks
    onResultCallback.current = onResult;
    onErrorCallback.current = onError || null;

    try {
      if (Platform.OS === 'web' && recognitionRef.current) {
        // Apply temporary options
        if (options) {
          Object.assign(recognitionRef.current, options);
        }
        
        recognitionRef.current.start();
        
        // Set timeout for automatic stop
        timeoutRef.current = setTimeout(() => {
          stopListening();
        }, 30000); // 30 seconds max
        
        return true;
      } else {
        // For mobile platforms, implement native voice recognition
        // This would use expo-speech or react-native-voice
        simulateMobileVoiceRecognition(onResult, onError);
        return true;
      }
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      onError?.('Failed to start voice recognition');
      return false;
    }
  };

  const stopListening = () => {
    if (!isListening) return;

    try {
      if (Platform.OS === 'web' && recognitionRef.current) {
        recognitionRef.current.stop();
      } else {
        // Stop mobile voice recognition
        setIsListening(false);
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } catch (error) {
      console.error('Failed to stop voice recognition:', error);
    }
  };

  const simulateMobileVoiceRecognition = (
    onResult: (results: VoiceRecognitionResult[]) => void,
    onError?: (error: string) => void
  ) => {
    setIsListening(true);
    
    // Simulate recording process
    setTimeout(() => {
      const demoResults: VoiceRecognitionResult[] = [
        {
          transcript: config.language.startsWith('ar') 
            ? 'أنشئ عقار جديد باسم برج الأمل يحتوي على عشرين وحدة'
            : 'Create a new property named Hope Tower with twenty units',
          confidence: 0.92,
          isFinal: true,
          alternatives: config.language.startsWith('ar') 
            ? ['أنشئ عقار جديد باسم برج الأمل', 'إنشاء عقار برج الأمل']
            : ['Create new property Hope Tower', 'Generate Hope Tower property'],
        },
      ];
      
      onResult(demoResults);
      setIsListening(false);
    }, 3000);
  };

  const updateLanguage = (language: string) => {
    const newConfig = { ...config, language };
    saveConfig(newConfig);
  };

  const updateSensitivity = (sensitivity: number) => {
    const newConfig = { ...config, sensitivity };
    saveConfig(newConfig);
  };

  const toggleNoiseReduction = () => {
    const newConfig = { ...config, noiseReduction: !config.noiseReduction };
    saveConfig(newConfig);
  };

  const checkPermissions = async () => {
    if (Platform.OS === 'web') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return { granted: true };
      } catch (error) {
        return { granted: false, error: 'Microphone access denied' };
      }
    } else {
      // For mobile, check microphone permissions
      // This would use expo-av or react-native-permissions
      return { granted: true }; // Simulate granted for demo
    }
  };

  const getSupportedLanguages = () => {
    if (Platform.OS === 'web') {
      // Web Speech API supported languages
      return [
        { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', nativeName: 'العربية (السعودية)' },
        { code: 'ar-AE', name: 'Arabic (UAE)', nativeName: 'العربية (الإمارات)' },
        { code: 'en-US', name: 'English (US)', nativeName: 'English (US)' },
        { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)' },
      ];
    } else {
      // Mobile supported languages
      return [
        { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', nativeName: 'العربية (السعودية)' },
        { code: 'en-US', name: 'English (US)', nativeName: 'English (US)' },
      ];
    }
  };

  return {
    isSupported,
    isListening,
    isAvailable,
    config,
    startListening,
    stopListening,
    updateLanguage,
    updateSensitivity,
    toggleNoiseReduction,
    checkPermissions,
    getSupportedLanguages,
    saveConfig,
  };
}