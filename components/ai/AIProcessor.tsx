import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { DatePicker } from '@/components/ui/DatePicker';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { UploadedFile } from './FileUploader';
import { Brain, Zap, Eye, FileText, MessageSquare, Sparkles, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Loader, RefreshCw, Download, Copy } from 'lucide-react-native';

interface AIProcessingResult {
  id: string;
  type: 'property_analysis' | 'unit_generation' | 'price_suggestion' | 'document_summary';
  title: string;
  content: string;
  confidence: number;
  suggestions: string[];
  metadata?: {
    processingTime: number;
    sourceFiles: string[];
    language: string;
  };
}

interface AIProcessorProps {
  voiceCommand?: string;
  uploadedFiles: UploadedFile[];
  onResultGenerated: (result: AIProcessingResult) => void;
  isProcessing: boolean;
  onProcessingChange: (processing: boolean) => void;
}

export function AIProcessor({ 
  voiceCommand, 
  uploadedFiles, 
  onResultGenerated,
  isProcessing,
  onProcessingChange 
}: AIProcessorProps) {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();
  
  const [processingStage, setProcessingStage] = useState<string>('');
  const [results, setResults] = useState<AIProcessingResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  const processingStages = {
    ar: [
      'تحليل الأمر الصوتي...',
      'معالجة الملفات المرفوعة...',
      'استخراج النصوص والبيانات...',
      'تحليل المحتوى بالذكاء الاصطناعي...',
      'توليد التوصيات...',
      'تنسيق النتائج...',
    ],
    en: [
      'Analyzing voice command...',
      'Processing uploaded files...',
      'Extracting text and data...',
      'AI content analysis...',
      'Generating recommendations...',
      'Formatting results...',
    ],
  };

  useEffect(() => {
    if (isProcessing) {
      simulateProcessing();
    }
  }, [isProcessing]);

  const simulateProcessing = async () => {
    const stages = processingStages[language];
    
    for (let i = 0; i < stages.length; i++) {
      setProcessingStage(stages[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Generate mock results based on input
    const mockResult = generateMockResult();
    setResults(prev => [...prev, mockResult]);
    onResultGenerated(mockResult);
    onProcessingChange(false);
    setProcessingStage('');
  };

  const generateMockResult = (): AIProcessingResult => {
    const hasVoiceCommand = !!voiceCommand?.trim();
    const hasFiles = uploadedFiles.length > 0;
    
    if (hasVoiceCommand && hasFiles) {
      return {
        id: `result_${Date.now()}`,
        type: 'property_analysis',
        title: language === 'ar' ? 'تحليل شامل للعقار' : 'Comprehensive Property Analysis',
        content: language === 'ar' 
          ? `بناءً على الأمر الصوتي والملفات المرفوعة، تم تحليل العقار وتوليد 25 وحدة سكنية موزعة على 5 طوابق. تم استخراج المعلومات من ${uploadedFiles.length} ملف ودمجها مع المتطلبات المحددة صوتياً.`
          : `Based on voice command and uploaded files, analyzed property and generated 25 residential units across 5 floors. Extracted information from ${uploadedFiles.length} files and integrated with voice-specified requirements.`,
        confidence: 92,
        suggestions: language === 'ar' 
          ? [
              'إضافة مصعد للطوابق العلوية',
              'تخصيص مواقف سيارات لكل وحدة',
              'إضافة منطقة ترفيهية مشتركة',
              'تحسين التهوية الطبيعية',
            ]
          : [
              'Add elevator for upper floors',
              'Allocate parking spaces per unit',
              'Add shared recreational area',
              'Improve natural ventilation',
            ],
        metadata: {
          processingTime: 4.2,
          sourceFiles: uploadedFiles.map(f => f.name),
          language,
        },
      };
    } else if (hasVoiceCommand) {
      return {
        id: `result_${Date.now()}`,
        type: 'unit_generation',
        title: language === 'ar' ? 'توليد الوحدات من الأمر الصوتي' : 'Unit Generation from Voice Command',
        content: language === 'ar' 
          ? 'تم تحليل الأمر الصوتي وتوليد هيكل العقار المطلوب مع توزيع الوحدات والأسعار المقترحة.'
          : 'Analyzed voice command and generated required property structure with unit distribution and suggested pricing.',
        confidence: 88,
        suggestions: language === 'ar' 
          ? [
              'مراجعة الأسعار المقترحة',
              'إضافة تفاصيل أكثر للوحدات',
              'تحديد المرافق المشتركة',
            ]
          : [
              'Review suggested pricing',
              'Add more unit details',
              'Specify shared amenities',
            ],
        metadata: {
          processingTime: 2.1,
          sourceFiles: [],
          language,
        },
      };
    } else if (hasFiles) {
      return {
        id: `result_${Date.now()}`,
        type: 'document_summary',
        title: language === 'ar' ? 'ملخص المستندات' : 'Document Summary',
        content: language === 'ar' 
          ? `تم تحليل ${uploadedFiles.length} ملف واستخراج المعلومات الرئيسية. تحتوي المستندات على تفاصيل عقارية ومخططات وحدات.`
          : `Analyzed ${uploadedFiles.length} files and extracted key information. Documents contain property details and unit layouts.`,
        confidence: 85,
        suggestions: language === 'ar' 
          ? [
              'إضافة أمر صوتي لتوضيح المتطلبات',
              'رفع مخططات إضافية',
              'تحديد نوع العقار المطلوب',
            ]
          : [
              'Add voice command to clarify requirements',
              'Upload additional blueprints',
              'Specify required property type',
            ],
        metadata: {
          processingTime: 3.5,
          sourceFiles: uploadedFiles.map(f => f.name),
          language,
        },
      };
    }

    return {
      id: `result_${Date.now()}`,
      type: 'property_analysis',
      title: language === 'ar' ? 'تحليل افتراضي' : 'Default Analysis',
      content: language === 'ar' 
        ? 'لم يتم توفير أمر صوتي أو ملفات. يرجى إضافة المدخلات المطلوبة.'
        : 'No voice command or files provided. Please add required inputs.',
      confidence: 0,
      suggestions: [],
      metadata: {
        processingTime: 0.1,
        sourceFiles: [],
        language,
      },
    };
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'property_analysis': return Brain;
      case 'unit_generation': return Sparkles;
      case 'price_suggestion': return DollarSign;
      case 'document_summary': return FileText;
      default: return MessageSquare;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return colors.success;
    if (confidence >= 70) return colors.warning;
    if (confidence >= 50) return colors.primary;
    return colors.danger;
  };

  const handleCopyResult = (content: string) => {
    // In a real app, use Clipboard API
    Alert.alert(
      language === 'ar' ? 'تم النسخ' : 'Copied',
      language === 'ar' ? 'تم نسخ النتيجة' : 'Result copied to clipboard'
    );
    console.log('📋 Copied to clipboard:', content);
  };

  const handleExportResult = (result: AIProcessingResult) => {
    Alert.alert(
      language === 'ar' ? 'تصدير النتيجة' : 'Export Result',
      language === 'ar' ? 'سيتم تصدير النتيجة كملف' : 'Result will be exported as file'
    );
  };

  const handleRegenerateResult = (resultId: string) => {
    Alert.alert(
      language === 'ar' ? 'إعادة التوليد' : 'Regenerate',
      language === 'ar' ? 'هل تريد إعادة توليد هذه النتيجة؟' : 'Do you want to regenerate this result?',
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { 
          text: language === 'ar' ? 'إعادة التوليد' : 'Regenerate',
          onPress: () => {
            onProcessingChange(true);
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Processing Status */}
      {isProcessing && (
        <View style={[styles.processingContainer, { backgroundColor: colors.primaryLight }]}>
          <View style={[styles.processingHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.processingIcon, { backgroundColor: colors.primary }]}>
              <Loader size={20} color={colors.surface} />
            </View>
            <View style={styles.processingInfo}>
              <Text
                style={[
                  styles.processingTitle,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'معالجة بالذكاء الاصطناعي' : 'AI Processing'}
              </Text>
              <Text
                style={[
                  styles.processingStage,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {processingStage}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Results List */}
      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text
            style={[
              styles.resultsTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'نتائج الذكاء الاصطناعي' : 'AI Results'}
          </Text>

          <ScrollView style={styles.resultsList} nestedScrollEnabled>
            {results.map((result) => {
              const ResultIcon = getResultIcon(result.type);
              const confidenceColor = getConfidenceColor(result.confidence);
              const isExpanded = selectedResult === result.id;

              return (
                <View key={result.id} style={[styles.resultCard, { backgroundColor: colors.surfaceSecondary }]}>
                  <TouchableOpacity
                    style={styles.resultHeader}
                    onPress={() => setSelectedResult(isExpanded ? null : result.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.resultHeaderContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <View style={[styles.resultIcon, { backgroundColor: colors.primaryLight }]}>
                        <ResultIcon size={20} color={colors.primary} />
                      </View>
                      <View style={styles.resultInfo}>
                        <Text
                          style={[
                            styles.resultTitle,
                            {
                              color: colors.textPrimary,
                              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                              textAlign: isRTL ? 'right' : 'left',
                            },
                          ]}
                        >
                          {result.title}
                        </Text>
                        <View style={[styles.confidenceContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                          <Text
                            style={[
                              styles.confidenceLabel,
                              {
                                color: colors.textSecondary,
                                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                              },
                            ]}
                          >
                            {language === 'ar' ? 'الثقة:' : 'Confidence:'}
                          </Text>
                          <Text
                            style={[
                              styles.confidenceValue,
                              {
                                color: confidenceColor,
                                fontFamily: 'monospace',
                              },
                            ]}
                          >
                            {result.confidence}%
                          </Text>
                        </View>
                      </View>
                      <View style={styles.resultActions}>
                        <TouchableOpacity
                          style={[styles.resultActionButton, { backgroundColor: colors.primaryLight }]}
                          onPress={() => setSelectedResult(isExpanded ? null : result.id)}
                        >
                          <Eye size={16} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <View style={styles.resultContent}>
                      <Text
                        style={[
                          styles.resultText,
                          {
                            color: colors.textSecondary,
                            fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {result.content}
                      </Text>

                      {/* Suggestions */}
                      {result.suggestions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                          <Text
                            style={[
                              styles.suggestionsTitle,
                              {
                                color: colors.textPrimary,
                                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                                textAlign: isRTL ? 'right' : 'left',
                              },
                            ]}
                          >
                            {language === 'ar' ? 'التوصيات:' : 'Suggestions:'}
                          </Text>
                          {result.suggestions.map((suggestion, index) => (
                            <View key={index} style={[styles.suggestionItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                              <View style={[styles.suggestionBullet, { backgroundColor: colors.success }]} />
                              <Text
                                style={[
                                  styles.suggestionText,
                                  {
                                    color: colors.textSecondary,
                                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                                    textAlign: isRTL ? 'right' : 'left',
                                  },
                                ]}
                              >
                                {suggestion}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Metadata */}
                      {result.metadata && (
                        <View style={[styles.metadataContainer, { backgroundColor: colors.surface }]}>
                          <Text
                            style={[
                              styles.metadataTitle,
                              {
                                color: colors.textMuted,
                                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                                textAlign: isRTL ? 'right' : 'left',
                              },
                            ]}
                          >
                            {language === 'ar' ? 'معلومات المعالجة:' : 'Processing Info:'}
                          </Text>
                          <Text
                            style={[
                              styles.metadataText,
                              {
                                color: colors.textMuted,
                                fontFamily: 'monospace',
                                textAlign: isRTL ? 'right' : 'left',
                              },
                            ]}
                          >
                            {language === 'ar' ? 'وقت المعالجة: ' : 'Processing time: '}{result.metadata.processingTime}s
                            {result.metadata.sourceFiles.length > 0 && (
                              `\n${language === 'ar' ? 'الملفات المصدر: ' : 'Source files: '}${result.metadata.sourceFiles.length}`
                            )}
                          </Text>
                        </View>
                      )}

                      {/* Action Buttons */}
                      <View style={[styles.resultActionButtons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
                          onPress={() => handleCopyResult(result.content)}
                          activeOpacity={0.7}
                        >
                          <Copy size={16} color={colors.primary} />
                          <Text
                            style={[
                              styles.actionButtonText,
                              {
                                color: colors.primary,
                                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                              },
                            ]}
                          >
                            {language === 'ar' ? 'نسخ' : 'Copy'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.successLight }]}
                          onPress={() => handleExportResult(result)}
                          activeOpacity={0.7}
                        >
                          <Download size={16} color={colors.success} />
                          <Text
                            style={[
                              styles.actionButtonText,
                              {
                                color: colors.success,
                                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                              },
                            ]}
                          >
                            {language === 'ar' ? 'تصدير' : 'Export'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.warningLight }]}
                          onPress={() => handleRegenerateResult(result.id)}
                          activeOpacity={0.7}
                        >
                          <RefreshCw size={16} color={colors.warning} />
                          <Text
                            style={[
                              styles.actionButtonText,
                              {
                                color: colors.warning,
                                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                              },
                            ]}
                          >
                            {language === 'ar' ? 'إعادة' : 'Retry'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Empty State */}
      {!isProcessing && results.length === 0 && (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primaryLight }]}>
            <Brain size={48} color={colors.primary} />
          </View>
          <Text
            style={[
              styles.emptyTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: 'center',
              },
            ]}
          >
            {language === 'ar' ? 'جاهز للمعالجة' : 'Ready for Processing'}
          </Text>
          <Text
            style={[
              styles.emptyText,
              {
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: 'center',
              },
            ]}
          >
            {language === 'ar' 
              ? 'أضف أمر صوتي أو ملفات لبدء المعالجة'
              : 'Add voice command or files to start processing'
            }
          </Text>
        </View>
      )}
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
  processingContainer: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#4CA771',
  },
  processingHeader: {
    alignItems: 'center',
    gap: spacing.md,
  },
  processingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingInfo: {
    flex: 1,
  },
  processingTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  processingStage: {
    fontSize: fontSize.sm,
  },
  resultsContainer: {
    marginBottom: spacing.lg,
  },
  resultsTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.md,
  },
  resultsList: {
    maxHeight: 400,
  },
  resultCard: {
    borderRadius: borderRadius.card,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  resultHeader: {
    padding: spacing.md,
  },
  resultHeaderContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  confidenceContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  confidenceLabel: {
    fontSize: fontSize.sm,
  },
  confidenceValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  resultActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  resultActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  resultText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  suggestionsContainer: {
    marginBottom: spacing.md,
  },
  suggestionsTitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  suggestionItem: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  suggestionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  suggestionText: {
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: 18,
  },
  metadataContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  metadataTitle: {
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  metadataText: {
    fontSize: fontSize.xs,
    lineHeight: 14,
  },
  resultActionButtons: {
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: fontSize.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
});