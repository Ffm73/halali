import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { DatePicker } from '@/components/ui/DatePicker';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { Upload, File, FileText, FileImage, FileAudio, FileVideo, X, Eye, Download, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Loader, Plus } from 'lucide-react-native';

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uri: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  preview?: string;
  extractedText?: string;
  metadata?: {
    pages?: number;
    duration?: number;
    dimensions?: { width: number; height: number };
  };
}

interface FileUploaderProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  onFileRemoved: (fileId: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  disabled?: boolean;
}

export function FileUploader({ 
  onFilesUploaded, 
  onFileRemoved,
  maxFiles = 10,
  maxFileSize = 50,
  acceptedTypes = ['pdf', 'docx', 'txt', 'csv', 'json', 'jpg', 'png', 'mp3', 'wav'],
  disabled = false 
}: FileUploaderProps) {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return FileImage;
    if (fileType.includes('audio')) return FileAudio;
    if (fileType.includes('video')) return FileVideo;
    if (fileType.includes('text') || fileType.includes('pdf') || fileType.includes('document')) return FileText;
    return File;
  };

  const getFileTypeColor = (fileType: string) => {
    if (fileType.includes('image')) return colors.success;
    if (fileType.includes('audio')) return colors.warning;
    if (fileType.includes('video')) return colors.danger;
    if (fileType.includes('text') || fileType.includes('pdf')) return colors.primary;
    return colors.textSecondary;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: { name: string; type: string; size: number }) => {
    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension && !acceptedTypes.includes(fileExtension)) {
      return {
        valid: false,
        error: language === 'ar' 
          ? `نوع الملف غير مدعوم: ${fileExtension}`
          : `Unsupported file type: ${fileExtension}`
      };
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return {
        valid: false,
        error: language === 'ar' 
          ? `حجم الملف كبير جداً (${formatFileSize(file.size)}). الحد الأقصى ${maxFileSize}MB`
          : `File too large (${formatFileSize(file.size)}). Maximum ${maxFileSize}MB`
      };
    }

    // Check max files limit
    if (uploadedFiles.length >= maxFiles) {
      return {
        valid: false,
        error: language === 'ar' 
          ? `تم الوصول للحد الأقصى من الملفات (${maxFiles})`
          : `Maximum file limit reached (${maxFiles})`
      };
    }

    return { valid: true };
  };

  const simulateFileUpload = async (file: UploadedFile) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === file.id 
            ? { ...f, progress }
            : f
        )
      );
    }

    // Simulate file processing and text extraction
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const extractedText = generateMockExtractedText(file.type);
    
    setUploadedFiles(prev => 
      prev.map(f => 
        f.id === file.id 
          ? { 
              ...f, 
              status: 'completed',
              extractedText,
              metadata: generateMockMetadata(file.type)
            }
          : f
      )
    );

    console.log('📁 File upload completed:', file.name);
  };

  const generateMockExtractedText = (fileType: string) => {
    if (fileType.includes('pdf') || fileType.includes('text')) {
      return language === 'ar' 
        ? 'عقار سكني يحتوي على 25 وحدة موزعة على 5 طوابق، كل وحدة تحتوي على غرفتي نوم وحمامين ومطبخ وصالة.'
        : 'Residential property containing 25 units distributed across 5 floors, each unit contains 2 bedrooms, 2 bathrooms, kitchen and living room.';
    }
    return '';
  };

  const generateMockMetadata = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return { pages: Math.floor(Math.random() * 10) + 1 };
    }
    if (fileType.includes('image')) {
      return { dimensions: { width: 1920, height: 1080 } };
    }
    if (fileType.includes('audio')) {
      return { duration: Math.floor(Math.random() * 300) + 30 };
    }
    return {};
  };

  const handleFileSelect = () => {
    // In a real app, this would open the file picker
    // For demo, we'll simulate file selection
    const mockFiles = [
      {
        name: 'property_plans.pdf',
        type: 'application/pdf',
        size: 2048576, // 2MB
      },
      {
        name: 'floor_layout.jpg',
        type: 'image/jpeg',
        size: 1024768, // 1MB
      },
      {
        name: 'property_description.txt',
        type: 'text/plain',
        size: 5120, // 5KB
      },
    ];

    const selectedFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      Alert.alert(
        language === 'ar' ? 'خطأ في الملف' : 'File Error',
        validation.error
      );
      return;
    }

    const newFile: UploadedFile = {
      id: `file_${Date.now()}`,
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size,
      uri: `mock://file/${selectedFile.name}`,
      status: 'uploading',
      progress: 0,
    };

    setUploadedFiles(prev => [...prev, newFile]);
    simulateFileUpload(newFile);
  };

  const handleFileRemove = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    onFileRemoved(fileId);
  };

  const handleFilePreview = (file: UploadedFile) => {
    Alert.alert(
      language === 'ar' ? 'معاينة الملف' : 'File Preview',
      language === 'ar' 
        ? `اسم الملف: ${file.name}\nالحجم: ${formatFileSize(file.size)}\nالنوع: ${file.type}`
        : `File: ${file.name}\nSize: ${formatFileSize(file.size)}\nType: ${file.type}`
    );
  };

  // Update parent component when files change
  React.useEffect(() => {
    const completedFiles = uploadedFiles.filter(f => f.status === 'completed');
    if (completedFiles.length > 0) {
      onFilesUploaded(completedFiles);
    }
  }, [uploadedFiles]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Upload Header */}
      <View style={[styles.uploadHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[styles.uploadIcon, { backgroundColor: colors.primaryLight }]}>
          <Upload size={20} color={colors.primary} />
        </View>
        <View style={styles.uploadInfo}>
          <Text
            style={[
              styles.uploadTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'رفع الملفات' : 'File Upload'}
          </Text>
          <Text
            style={[
              styles.uploadSubtitle,
              {
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' 
              ? `${uploadedFiles.length}/${maxFiles} ملفات`
              : `${uploadedFiles.length}/${maxFiles} files`
            }
          </Text>
        </View>
      </View>

      {/* Drop Zone */}
      <TouchableOpacity
        style={[
          styles.dropZone,
          {
            backgroundColor: isDragOver ? colors.primaryLight : colors.surfaceSecondary,
            borderColor: isDragOver ? colors.primary : colors.border,
          },
          disabled && { opacity: 0.5 },
        ]}
        onPress={handleFileSelect}
        disabled={disabled || uploadedFiles.length >= maxFiles}
        activeOpacity={0.8}
      >
        <View style={styles.dropZoneContent}>
          <View style={[styles.dropZoneIcon, { backgroundColor: colors.primaryLight }]}>
            <Plus size={32} color={colors.primary} />
          </View>
          <Text
            style={[
              styles.dropZoneTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: 'center',
              },
            ]}
          >
            {language === 'ar' ? 'اختر الملفات' : 'Select Files'}
          </Text>
          <Text
            style={[
              styles.dropZoneSubtitle,
              {
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: 'center',
              },
            ]}
          >
            {language === 'ar' 
              ? `PDF, DOCX, TXT, صور، صوت (حتى ${maxFileSize}MB)`
              : `PDF, DOCX, TXT, Images, Audio (up to ${maxFileSize}MB)`
            }
          </Text>
        </View>
      </TouchableOpacity>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <View style={styles.filesContainer}>
          <Text
            style={[
              styles.filesTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'الملفات المرفوعة' : 'Uploaded Files'}
          </Text>
          
          <ScrollView style={styles.filesList} nestedScrollEnabled>
            {uploadedFiles.map((file) => {
              const FileIcon = getFileIcon(file.type);
              const fileColor = getFileTypeColor(file.type);
              
              return (
                <View key={file.id} style={[styles.fileItem, { backgroundColor: colors.surfaceSecondary }]}>
                  <View style={[styles.fileHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.fileIconContainer, { backgroundColor: `${fileColor}15` }]}>
                      <FileIcon size={20} color={fileColor} />
                    </View>
                    <View style={styles.fileInfo}>
                      <Text
                        style={[
                          styles.fileName,
                          {
                            color: colors.textPrimary,
                            fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {file.name}
                      </Text>
                      <Text
                        style={[
                          styles.fileSize,
                          {
                            color: colors.textSecondary,
                            fontFamily: 'monospace',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {formatFileSize(file.size)}
                      </Text>
                    </View>
                    <View style={styles.fileActions}>
                      {file.status === 'completed' && (
                        <TouchableOpacity
                          style={[styles.fileActionButton, { backgroundColor: colors.primaryLight }]}
                          onPress={() => handleFilePreview(file)}
                          activeOpacity={0.7}
                        >
                          <Eye size={16} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.fileActionButton, { backgroundColor: colors.dangerLight }]}
                        onPress={() => handleFileRemove(file.id)}
                        activeOpacity={0.7}
                      >
                        <X size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <View style={styles.progressContainer}>
                      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              backgroundColor: colors.primary,
                              width: `${file.progress}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.progressText,
                          {
                            color: colors.textMuted,
                            fontFamily: 'monospace',
                          },
                        ]}
                      >
                        {file.progress}%
                      </Text>
                    </View>
                  )}

                  {/* Status Indicator */}
                  <View style={[styles.statusIndicator, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    {file.status === 'uploading' && (
                      <>
                        <Loader size={16} color={colors.warning} />
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color: colors.warning,
                              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                            },
                          ]}
                        >
                          {language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}
                        </Text>
                      </>
                    )}
                    {file.status === 'completed' && (
                      <>
                        <CheckCircle size={16} color={colors.success} />
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color: colors.success,
                              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                            },
                          ]}
                        >
                          {language === 'ar' ? 'تم الرفع' : 'Completed'}
                        </Text>
                      </>
                    )}
                    {file.status === 'error' && (
                      <>
                        <AlertCircle size={16} color={colors.danger} />
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color: colors.danger,
                              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                            },
                          ]}
                        >
                          {language === 'ar' ? 'خطأ في الرفع' : 'Upload Error'}
                        </Text>
                      </>
                    )}
                  </View>

                  {/* Extracted Content Preview */}
                  {file.extractedText && (
                    <View style={[styles.extractedContent, { backgroundColor: colors.successLight }]}>
                      <Text
                        style={[
                          styles.extractedTitle,
                          {
                            color: colors.success,
                            fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {language === 'ar' ? 'النص المستخرج:' : 'Extracted Text:'}
                      </Text>
                      <Text
                        style={[
                          styles.extractedText,
                          {
                            color: colors.textSecondary,
                            fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                        numberOfLines={3}
                      >
                        {file.extractedText}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Supported Formats */}
      <View style={[styles.supportedFormats, { backgroundColor: colors.surfaceSecondary }]}>
        <Text
          style={[
            styles.supportedTitle,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'الصيغ المدعومة:' : 'Supported Formats:'}
        </Text>
        <View style={styles.formatsList}>
          {acceptedTypes.map((type, index) => (
            <View key={index} style={[styles.formatChip, { backgroundColor: colors.surface }]}>
              <Text
                style={[
                  styles.formatText,
                  {
                    color: colors.textSecondary,
                    fontFamily: 'monospace',
                  },
                ]}
              >
                .{type.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
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
  uploadHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  uploadIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadInfo: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  uploadSubtitle: {
    fontSize: fontSize.sm,
  },
  dropZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: borderRadius.card,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    minHeight: 120,
    justifyContent: 'center',
  },
  dropZoneContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  dropZoneIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropZoneTitle: {
    fontSize: fontSize.lg,
  },
  dropZoneSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  filesContainer: {
    marginBottom: spacing.lg,
  },
  filesTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  filesList: {
    maxHeight: 300,
  },
  fileItem: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    zIndex: 1,
  },
  fileHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  fileSize: {
    fontSize: fontSize.xs,
  },
  fileActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fileActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: fontSize.xs,
    minWidth: 40,
    textAlign: 'right',
  },
  statusIndicator: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
  },
  extractedContent: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(76, 167, 113, 0.3)',
  },
  extractedTitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  extractedText: {
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  supportedFormats: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  supportedTitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  formatsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  formatChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  formatText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});