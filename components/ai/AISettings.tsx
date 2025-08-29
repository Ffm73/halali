import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { DatePicker } from '@/components/ui/DatePicker';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { Settings, Mic, Volume2, FileText, Shield, Zap, Globe, FileSliders as Sliders, Bell, Eye, Lock } from 'lucide-react-native';

export interface AISettingsConfig {
  voice: {
    enabled: boolean;
    language: 'ar' | 'en' | 'auto';
    sensitivity: number;
    noiseReduction: boolean;
    autoTranscribe: boolean;
    voiceActivation: boolean;
  };
  files: {
    autoProcess: boolean;
    maxFileSize: number;
    allowedTypes: string[];
    autoExtractText: boolean;
    compressImages: boolean;
    secureDelete: boolean;
  };
  ai: {
    model: 'gpt-3.5-turbo' | 'gpt-4' | 'claude';
    temperature: number;
    maxTokens: number;
    contextWindow: number;
    enableSuggestions: boolean;
    confidenceThreshold: number;
  };
  privacy: {
    storeConversations: boolean;
    shareAnalytics: boolean;
    encryptFiles: boolean;
    autoDeleteAfter: number; // days
  };
}

interface AISettingsProps {
  onSettingsChange: (settings: AISettingsConfig) => void;
  visible: boolean;
  onClose: () => void;
}

export function AISettings({ onSettingsChange, visible, onClose }: AISettingsProps) {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();
  
  const [settings, setSettings] = useState<AISettingsConfig>({
    voice: {
      enabled: true,
      language: 'auto',
      sensitivity: 70,
      noiseReduction: true,
      autoTranscribe: true,
      voiceActivation: false,
    },
    files: {
      autoProcess: true,
      maxFileSize: 50,
      allowedTypes: ['pdf', 'docx', 'txt', 'csv', 'json', 'jpg', 'png', 'mp3', 'wav'],
      autoExtractText: true,
      compressImages: true,
      secureDelete: true,
    },
    ai: {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000,
      contextWindow: 4000,
      enableSuggestions: true,
      confidenceThreshold: 70,
    },
    privacy: {
      storeConversations: false,
      shareAnalytics: false,
      encryptFiles: true,
      autoDeleteAfter: 30,
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('aiSettings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error);
    }
  };

  const saveSettings = async (newSettings: AISettingsConfig) => {
    try {
      await AsyncStorage.setItem('aiSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      onSettingsChange(newSettings);
      console.log('✅ AI settings saved');
    } catch (error) {
      console.error('Failed to save AI settings:', error);
    }
  };

  const updateSetting = (category: keyof AISettingsConfig, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    };
    saveSettings(newSettings);
  };

  const renderSettingSection = (
    title: string,
    icon: React.ComponentType<any>,
    children: React.ReactNode
  ) => (
    <View style={[styles.settingSection, { backgroundColor: colors.surface }]}>
      <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[styles.sectionIcon, { backgroundColor: colors.primaryLight }]}>
          {React.createElement(icon, { size: 20, color: colors.primary })}
        </View>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );

  const renderToggleSetting = (
    label: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={[styles.settingItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <View style={styles.settingInfo}>
        <Text
          style={[
            styles.settingLabel,
            {
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.settingDescription,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={value ? colors.primary : colors.textMuted}
      />
    </View>
  );

  const renderSliderSetting = (
    label: string,
    description: string,
    value: number,
    min: number,
    max: number,
    onValueChange: (value: number) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <View style={[styles.sliderHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text
            style={[
              styles.settingLabel,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {label}
          </Text>
          <Text
            style={[
              styles.sliderValue,
              {
                color: colors.primary,
                fontFamily: 'monospace',
              },
            ]}
          >
            {value}
          </Text>
        </View>
        <Text
          style={[
            styles.settingDescription,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {description}
        </Text>
      </View>
      
      {/* Custom Slider */}
      <View style={styles.sliderContainer}>
        <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.sliderFill,
              {
                backgroundColor: colors.primary,
                width: `${((value - min) / (max - min)) * 100}%`,
              },
            ]}
          />
        </View>
        <View style={styles.sliderLabels}>
          <Text style={[styles.sliderLabel, { color: colors.textMuted }]}>{min}</Text>
          <Text style={[styles.sliderLabel, { color: colors.textMuted }]}>{max}</Text>
        </View>
      </View>
    </View>
  );

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Voice Settings */}
        {renderSettingSection(
          language === 'ar' ? 'إعدادات الصوت' : 'Voice Settings',
          Mic,
          <>
            {renderToggleSetting(
              language === 'ar' ? 'تفعيل الإدخال الصوتي' : 'Enable Voice Input',
              language === 'ar' ? 'السماح بالتحكم الصوتي' : 'Allow voice control',
              settings.voice.enabled,
              (value) => updateSetting('voice', 'enabled', value)
            )}
            
            {renderToggleSetting(
              language === 'ar' ? 'تقليل الضوضاء' : 'Noise Reduction',
              language === 'ar' ? 'تصفية الأصوات الخلفية' : 'Filter background noise',
              settings.voice.noiseReduction,
              (value) => updateSetting('voice', 'noiseReduction', value)
            )}

            {renderSliderSetting(
              language === 'ar' ? 'حساسية الميكروفون' : 'Microphone Sensitivity',
              language === 'ar' ? 'مستوى حساسية التقاط الصوت' : 'Voice pickup sensitivity level',
              settings.voice.sensitivity,
              0,
              100,
              (value) => updateSetting('voice', 'sensitivity', value)
            )}
          </>
        )}

        {/* File Settings */}
        {renderSettingSection(
          language === 'ar' ? 'إعدادات الملفات' : 'File Settings',
          FileText,
          <>
            {renderToggleSetting(
              language === 'ar' ? 'معالجة تلقائية' : 'Auto Processing',
              language === 'ar' ? 'معالجة الملفات فور رفعها' : 'Process files immediately after upload',
              settings.files.autoProcess,
              (value) => updateSetting('files', 'autoProcess', value)
            )}
            
            {renderToggleSetting(
              language === 'ar' ? 'استخراج النص تلقائياً' : 'Auto Text Extraction',
              language === 'ar' ? 'استخراج النص من المستندات والصور' : 'Extract text from documents and images',
              settings.files.autoExtractText,
              (value) => updateSetting('files', 'autoExtractText', value)
            )}

            {renderToggleSetting(
              language === 'ar' ? 'ضغط الصور' : 'Compress Images',
              language === 'ar' ? 'تقليل حجم الصور لتوفير المساحة' : 'Reduce image size to save space',
              settings.files.compressImages,
              (value) => updateSetting('files', 'compressImages', value)
            )}
          </>
        )}

        {/* AI Model Settings */}
        {renderSettingSection(
          language === 'ar' ? 'إعدادات الذكاء الاصطناعي' : 'AI Model Settings',
          Zap,
          <>
            {renderToggleSetting(
              language === 'ar' ? 'تفعيل التوصيات' : 'Enable Suggestions',
              language === 'ar' ? 'عرض توصيات ذكية للتحسين' : 'Show smart improvement suggestions',
              settings.ai.enableSuggestions,
              (value) => updateSetting('ai', 'enableSuggestions', value)
            )}

            {renderSliderSetting(
              language === 'ar' ? 'حد الثقة' : 'Confidence Threshold',
              language === 'ar' ? 'الحد الأدنى لثقة النتائج' : 'Minimum confidence for results',
              settings.ai.confidenceThreshold,
              0,
              100,
              (value) => updateSetting('ai', 'confidenceThreshold', value)
            )}

            {renderSliderSetting(
              language === 'ar' ? 'الإبداع' : 'Creativity',
              language === 'ar' ? 'مستوى الإبداع في الاقتراحات' : 'Creativity level in suggestions',
              Math.round(settings.ai.temperature * 100),
              0,
              100,
              (value) => updateSetting('ai', 'temperature', value / 100)
            )}
          </>
        )}

        {/* Privacy Settings */}
        {renderSettingSection(
          language === 'ar' ? 'الخصوصية والأمان' : 'Privacy & Security',
          Shield,
          <>
            {renderToggleSetting(
              language === 'ar' ? 'تشفير الملفات' : 'Encrypt Files',
              language === 'ar' ? 'تشفير الملفات المرفوعة' : 'Encrypt uploaded files',
              settings.privacy.encryptFiles,
              (value) => updateSetting('privacy', 'encryptFiles', value)
            )}
            
            {renderToggleSetting(
              language === 'ar' ? 'حفظ المحادثات' : 'Store Conversations',
              language === 'ar' ? 'حفظ سجل المحادثات للمراجعة' : 'Save conversation history for review',
              settings.privacy.storeConversations,
              (value) => updateSetting('privacy', 'storeConversations', value)
            )}

            {renderToggleSetting(
              language === 'ar' ? 'مشاركة التحليلات' : 'Share Analytics',
              language === 'ar' ? 'مشاركة بيانات الاستخدام لتحسين الخدمة' : 'Share usage data to improve service',
              settings.privacy.shareAnalytics,
              (value) => updateSetting('privacy', 'shareAnalytics', value)
            )}

            {renderSliderSetting(
              language === 'ar' ? 'حذف تلقائي بعد (أيام)' : 'Auto Delete After (days)',
              language === 'ar' ? 'حذف البيانات تلقائياً بعد فترة' : 'Automatically delete data after period',
              settings.privacy.autoDeleteAfter,
              1,
              365,
              (value) => updateSetting('privacy', 'autoDeleteAfter', value)
            )}
          </>
        )}

        {/* Reset to Defaults */}
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: colors.dangerLight }]}
          onPress={() => {
            const defaultSettings: AISettingsConfig = {
              voice: {
                enabled: true,
                language: 'auto',
                sensitivity: 70,
                noiseReduction: true,
                autoTranscribe: true,
                voiceActivation: false,
              },
              files: {
                autoProcess: true,
                maxFileSize: 50,
                allowedTypes: ['pdf', 'docx', 'txt', 'csv', 'json', 'jpg', 'png', 'mp3', 'wav'],
                autoExtractText: true,
                compressImages: true,
                secureDelete: true,
              },
              ai: {
                model: 'gpt-3.5-turbo',
                temperature: 0.7,
                maxTokens: 2000,
                contextWindow: 4000,
                enableSuggestions: true,
                confidenceThreshold: 70,
              },
              privacy: {
                storeConversations: false,
                shareAnalytics: false,
                encryptFiles: true,
                autoDeleteAfter: 30,
              },
            };
            saveSettings(defaultSettings);
          }}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.resetButtonText,
              {
                color: colors.danger,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              },
            ]}
          >
            {language === 'ar' ? 'إعادة تعيين للافتراضي' : 'Reset to Defaults'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  settingSection: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    flex: 1,
  },
  settingItem: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  sliderHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sliderValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  sliderContainer: {
    marginTop: spacing.sm,
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    marginBottom: spacing.xs,
  },
  sliderFill: {
    height: '100%',
    borderRadius: 3,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: fontSize.xs,
  },
  resetButton: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginTop: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resetButtonText: {
    fontSize: fontSize.md,
  },
});