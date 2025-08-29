import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { DatePicker } from '@/components/ui/DatePicker';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { Mic, MicOff, Volume2, VolumeX, Pause, Play, RotateCcw } from 'lucide-react-native';

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  onError: (error: string) => void;
  isProcessing?: boolean;
  disabled?: boolean;
}

export function VoiceRecorder({ 
  onTranscriptionComplete, 
  onError, 
  isProcessing = false,
  disabled = false 
}: VoiceRecorderProps) {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const levelAnim = useRef(new Animated.Value(0)).current;
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start duration timer
      durationInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Simulate audio level changes
      const levelInterval = setInterval(() => {
        const newLevel = Math.random() * 100;
        setAudioLevel(newLevel);
        Animated.timing(levelAnim, {
          toValue: newLevel / 100,
          duration: 100,
          useNativeDriver: false,
        }).start();
      }, 100);

      return () => {
        clearInterval(levelInterval);
      };
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      // In a real app, request microphone permissions and start recording
      // For demo, we'll simulate the recording process
      setIsRecording(true);
      setRecordingDuration(0);
      setHasRecording(false);
      
      console.log('🎤 Voice recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      onError(language === 'ar' ? 'فشل في بدء التسجيل' : 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setHasRecording(true);
      
      // Simulate transcription process
      setTimeout(() => {
        const demoTranscriptions = {
          ar: [
            'أنشئ عقار جديد باسم برج الأمل يحتوي على عشرين وحدة',
            'أضف مجمع سكني النور ثلاثين وحدة بغرف نوم مختلفة',
            'إنشاء عقار مجمع الياسمين خمس وعشرين وحدة في خمسة طوابق',
          ],
          en: [
            'Create a new property named Hope Tower with twenty units',
            'Add residential complex Al-Noor thirty units with different bedrooms',
            'Create property Jasmine Complex twenty-five units across five floors',
          ],
        };
        
        const transcriptions = demoTranscriptions[language];
        const randomTranscription = transcriptions[Math.floor(Math.random() * transcriptions.length)];
        
        onTranscriptionComplete(randomTranscription);
      }, 1500);
      
      console.log('🎤 Voice recording stopped, processing...');
    } catch (error) {
      console.error('Failed to stop recording:', error);
      onError(language === 'ar' ? 'فشل في إيقاف التسجيل' : 'Failed to stop recording');
    }
  };

  const playRecording = () => {
    setIsPlaying(true);
    // Simulate playback
    setTimeout(() => {
      setIsPlaying(false);
    }, recordingDuration * 1000);
  };

  const clearRecording = () => {
    setHasRecording(false);
    setRecordingDuration(0);
    setAudioLevel(0);
    levelAnim.setValue(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Recording Status */}
      <View style={[styles.statusContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[styles.statusIcon, { backgroundColor: colors.primaryLight }]}>
          <Mic size={20} color={colors.primary} />
        </View>
        <View style={styles.statusInfo}>
          <Text
            style={[
              styles.statusTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'التسجيل الصوتي' : 'Voice Recording'}
          </Text>
          <Text
            style={[
              styles.statusSubtitle,
              {
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {isRecording 
              ? (language === 'ar' ? 'جاري التسجيل...' : 'Recording...') 
              : (language === 'ar' ? 'اضغط للتسجيل' : 'Tap to record')
            }
          </Text>
        </View>
        {isRecording && (
          <Text
            style={[
              styles.duration,
              {
                color: colors.danger,
                fontFamily: 'monospace',
              },
            ]}
          >
            {formatDuration(recordingDuration)}
          </Text>
        )}
      </View>

      {/* Audio Level Indicator */}
      {isRecording && (
        <View style={styles.audioLevelContainer}>
          <View style={[styles.audioLevelBar, { backgroundColor: colors.surfaceSecondary }]}>
            <Animated.View
              style={[
                styles.audioLevelFill,
                {
                  backgroundColor: colors.success,
                  width: levelAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text
            style={[
              styles.audioLevelText,
              {
                color: colors.textMuted,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              },
            ]}
          >
            {language === 'ar' ? 'مستوى الصوت' : 'Audio Level'}
          </Text>
        </View>
      )}

      {/* Recording Controls */}
      <View style={[styles.controlsContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {/* Main Record Button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              {
                backgroundColor: isRecording ? colors.danger : colors.primary,
              },
              disabled && { opacity: 0.5 },
            ]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={disabled || isProcessing}
            activeOpacity={0.8}
          >
            {isRecording ? (
              <MicOff size={32} color={colors.surface} />
            ) : (
              <Mic size={32} color={colors.surface} />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Playback Controls */}
        {hasRecording && !isRecording && (
          <View style={[styles.playbackControls, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              style={[styles.playbackButton, { backgroundColor: colors.successLight }]}
              onPress={playRecording}
              disabled={isPlaying}
              activeOpacity={0.7}
            >
              {isPlaying ? (
                <Pause size={20} color={colors.success} />
              ) : (
                <Play size={20} color={colors.success} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.playbackButton, { backgroundColor: colors.warningLight }]}
              onPress={clearRecording}
              activeOpacity={0.7}
            >
              <RotateCcw size={20} color={colors.warning} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Recording Info */}
      {hasRecording && (
        <View style={[styles.recordingInfo, { backgroundColor: colors.successLight }]}>
          <Text
            style={[
              styles.recordingInfoText,
              {
                color: colors.success,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: 'center',
              },
            ]}
          >
            {language === 'ar' 
              ? `تم التسجيل لمدة ${formatDuration(recordingDuration)} - جاري المعالجة...`
              : `Recorded ${formatDuration(recordingDuration)} - Processing...`
            }
          </Text>
        </View>
      )}

      {/* Voice Tips */}
      <View style={[styles.tipsContainer, { backgroundColor: colors.surfaceSecondary }]}>
        <Text
          style={[
            styles.tipsTitle,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'نصائح للتسجيل:' : 'Recording Tips:'}
        </Text>
        <Text
          style={[
            styles.tipsText,
            {
              color: colors.textMuted,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' 
            ? '• تحدث بوضوح وببطء\n• تجنب الضوضاء في الخلفية\n• اذكر تفاصيل العقار بدقة'
            : '• Speak clearly and slowly\n• Avoid background noise\n• Mention property details precisely'
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  statusContainer: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  statusSubtitle: {
    fontSize: fontSize.sm,
  },
  duration: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  audioLevelContainer: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  audioLevelBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  audioLevelFill: {
    height: '100%',
    borderRadius: 4,
  },
  audioLevelText: {
    fontSize: fontSize.xs,
  },
  controlsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  playbackControls: {
    gap: spacing.md,
  },
  playbackButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recordingInfo: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  recordingInfoText: {
    fontSize: fontSize.sm,
  },
  tipsContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  tipsTitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  tipsText: {
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
});