import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TextToSpeechConfig {
  language: string;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  enabled: boolean;
}

export interface Voice {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female';
  quality: 'low' | 'normal' | 'high';
}

export function useTextToSpeech() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [config, setConfig] = useState<TextToSpeechConfig>({
    language: 'ar-SA',
    voice: '',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    enabled: true,
  });

  useEffect(() => {
    initializeTextToSpeech();
    loadConfig();
  }, []);

  const initializeTextToSpeech = async () => {
    if (Platform.OS === 'web') {
      // Web Speech Synthesis API
      if ('speechSynthesis' in window) {
        setIsSupported(true);
        loadWebVoices();
        
        // Listen for voices changed event
        speechSynthesis.onvoiceschanged = loadWebVoices;
      } else {
        console.log('🔊 Text-to-speech not supported on this browser');
        setIsSupported(false);
      }
    } else {
      // For React Native, you would use expo-speech
      setIsSupported(true);
      loadMobileVoices();
      console.log('🔊 Text-to-speech initialized for mobile');
    }
  };

  const loadWebVoices = () => {
    const voices = speechSynthesis.getVoices();
    const formattedVoices: Voice[] = voices
      .filter(voice => voice.lang.startsWith('ar') || voice.lang.startsWith('en'))
      .map(voice => ({
        id: voice.voiceURI,
        name: voice.name,
        language: voice.lang,
        gender: voice.name.toLowerCase().includes('female') ? 'female' : 'male',
        quality: voice.localService ? 'high' : 'normal',
      }));
    
    setAvailableVoices(formattedVoices);
    
    // Set default voice if not already set
    if (!config.voice && formattedVoices.length > 0) {
      const arabicVoice = formattedVoices.find(v => v.language.startsWith('ar'));
      const defaultVoice = arabicVoice || formattedVoices[0];
      setConfig(prev => ({ ...prev, voice: defaultVoice.id }));
    }
  };

  const loadMobileVoices = () => {
    // Mock voices for mobile demo
    const mockVoices: Voice[] = [
      {
        id: 'ar-SA-male',
        name: 'Arabic Male Voice',
        language: 'ar-SA',
        gender: 'male',
        quality: 'high',
      },
      {
        id: 'ar-SA-female',
        name: 'Arabic Female Voice',
        language: 'ar-SA',
        gender: 'female',
        quality: 'high',
      },
      {
        id: 'en-US-male',
        name: 'English Male Voice',
        language: 'en-US',
        gender: 'male',
        quality: 'high',
      },
      {
        id: 'en-US-female',
        name: 'English Female Voice',
        language: 'en-US',
        gender: 'female',
        quality: 'high',
      },
    ];
    
    setAvailableVoices(mockVoices);
  };

  const loadConfig = async () => {
    try {
      const stored = await AsyncStorage.getItem('textToSpeechConfig');
      if (stored) {
        setConfig(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load TTS config:', error);
    }
  };

  const saveConfig = async (newConfig: TextToSpeechConfig) => {
    try {
      await AsyncStorage.setItem('textToSpeechConfig', JSON.stringify(newConfig));
      setConfig(newConfig);
      console.log('✅ TTS config saved');
    } catch (error) {
      console.error('Failed to save TTS config:', error);
    }
  };

  const speak = async (
    text: string,
    options?: Partial<TextToSpeechConfig>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupported || !config.enabled) {
      return { success: false, error: 'Text-to-speech not available' };
    }

    if (isSpeaking) {
      stop();
    }

    try {
      const finalConfig = { ...config, ...options };
      
      if (Platform.OS === 'web') {
        return await speakWeb(text, finalConfig);
      } else {
        return await speakMobile(text, finalConfig);
      }
    } catch (error) {
      console.error('TTS error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Speech synthesis failed' 
      };
    }
  };

  const speakWeb = async (text: string, config: TextToSpeechConfig): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Find the selected voice
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.voiceURI === config.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.lang = config.language;
      utterance.rate = config.rate;
      utterance.pitch = config.pitch;
      utterance.volume = config.volume;

      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log('🔊 Speech started');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        console.log('🔊 Speech ended');
        resolve({ success: true });
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        console.error('🔊 Speech error:', event.error);
        resolve({ success: false, error: `Speech error: ${event.error}` });
      };

      speechSynthesis.speak(utterance);
    });
  };

  const speakMobile = async (text: string, config: TextToSpeechConfig): Promise<{ success: boolean; error?: string }> => {
    // For mobile, you would use expo-speech
    // import * as Speech from 'expo-speech';
    
    setIsSpeaking(true);
    
    // Simulate speech for demo
    return new Promise((resolve) => {
      const duration = Math.max(2000, text.length * 50); // Estimate duration
      
      setTimeout(() => {
        setIsSpeaking(false);
        resolve({ success: true });
      }, duration);
      
      console.log('🔊 Mobile TTS simulation:', text.substring(0, 50) + '...');
    });
  };

  const stop = () => {
    if (!isSpeaking) return;

    try {
      if (Platform.OS === 'web') {
        speechSynthesis.cancel();
      } else {
        // Stop mobile TTS
        // Speech.stop();
      }
      
      setIsSpeaking(false);
      console.log('🔊 Speech stopped');
    } catch (error) {
      console.error('Failed to stop speech:', error);
    }
  };

  const pause = () => {
    if (!isSpeaking) return;

    try {
      if (Platform.OS === 'web') {
        speechSynthesis.pause();
      }
      console.log('🔊 Speech paused');
    } catch (error) {
      console.error('Failed to pause speech:', error);
    }
  };

  const resume = () => {
    try {
      if (Platform.OS === 'web') {
        speechSynthesis.resume();
      }
      console.log('🔊 Speech resumed');
    } catch (error) {
      console.error('Failed to resume speech:', error);
    }
  };

  const getVoicesForLanguage = (language: string) => {
    return availableVoices.filter(voice => 
      voice.language.startsWith(language.split('-')[0])
    );
  };

  const setVoice = (voiceId: string) => {
    const newConfig = { ...config, voice: voiceId };
    saveConfig(newConfig);
  };

  const setRate = (rate: number) => {
    const clampedRate = Math.max(0.1, Math.min(3.0, rate));
    const newConfig = { ...config, rate: clampedRate };
    saveConfig(newConfig);
  };

  const setPitch = (pitch: number) => {
    const clampedPitch = Math.max(0.1, Math.min(2.0, pitch));
    const newConfig = { ...config, pitch: clampedPitch };
    saveConfig(newConfig);
  };

  const setVolume = (volume: number) => {
    const clampedVolume = Math.max(0.0, Math.min(1.0, volume));
    const newConfig = { ...config, volume: clampedVolume };
    saveConfig(newConfig);
  };

  const toggleEnabled = () => {
    const newConfig = { ...config, enabled: !config.enabled };
    saveConfig(newConfig);
  };

  return {
    isSupported,
    isSpeaking,
    availableVoices,
    config,
    speak,
    stop,
    pause,
    resume,
    setVoice,
    setRate,
    setPitch,
    setVolume,
    toggleEnabled,
    getVoicesForLanguage,
    saveConfig,
  };
}