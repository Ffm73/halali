import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { VoiceRecorder } from '@/components/ai/VoiceRecorder';
import { FileUploader, UploadedFile } from '@/components/ai/FileUploader';
import { AIProcessor } from '@/components/ai/AIProcessor';
import { AISettings, AISettingsConfig } from '@/components/ai/AISettings';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useAIFeatures } from '@/hooks/useAIFeatures';
import { getAIResponse } from '@/utils/openai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { Unit } from '@/types';
import { Mic, MicOff, Wand as Wand2, Building2, Home, Bed, Bath, DollarSign, Sparkles, Eye, CreditCard as Edit3, Save, Plus, Trash2, MapPin, Users, Calendar, TrendingUp, Settings, Upload, Brain, Zap, X } from 'lucide-react-native';

interface GeneratedUnit {
  id: string;
  unitLabel: string;
  bedrooms: number;
  bathrooms: number;
  hasKitchen: boolean;
  hasLivingRoom: boolean;
  floor: number;
  sizeSqm?: number;
  amenities: string[];
  suggestedPrice: number;
  isAISuggested: boolean;
  status: 'available' | 'occupied' | 'maintenance';
}

interface GeneratedProperty {
  name: string;
  address?: string;
  city?: string;
  totalUnits: number;
  units: GeneratedUnit[];
  summary: {
    oneBedroomCount: number;
    twoBedroomCount: number;
    threeBedroomCount: number;
    averagePrice: number;
    totalValue: number;
  };
}

export default function AICreateScreen() {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { 
    context, 
    settings, 
    isProcessing, 
    updateContext, 
    generateProperty,
    analyzeDocuments 
  } = useAIFeatures();
  
  const [command, setCommand] = useState('');
  const [activeTab, setActiveTab] = useState<'voice' | 'files' | 'results'>('voice');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [aiResults, setAIResults] = useState<any[]>([]);
  const [generatedProperty, setGeneratedProperty] = useState<GeneratedProperty | null>(null);
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSavingProperty, setIsSavingProperty] = useState(false);

  const tabs = [
    {
      id: 'voice',
      label: language === 'ar' ? 'الأوامر الصوتية' : 'Voice Commands',
      icon: Mic,
      color: colors.primary,
    },
    {
      id: 'files',
      label: language === 'ar' ? 'رفع الملفات' : 'File Upload',
      icon: Upload,
      color: colors.success,
    },
    {
      id: 'results',
      label: language === 'ar' ? 'النتائج' : 'Results',
      icon: Brain,
      color: colors.warning,
    },
  ];

  const exampleCommands = [
    {
      text: language === 'ar' 
        ? 'أنشئ عقار جديد باسم "برج الأمل" يحتوي على 20 وحدة: 10 وحدات بغرفة نوم واحدة و 10 وحدات بغرفتي نوم'
        : 'Create a new property named "Hope Tower" with 20 units: 10 one-bedroom units and 10 two-bedroom units',
      icon: Building2,
    },
    {
      text: language === 'ar'
        ? 'أضف مجمع سكني "النور" 30 وحدة: 15 وحدة بغرفة نوم وحمام ومطبخ، 15 وحدة بغرفتين وحمامين ومطبخ وصالة'
        : 'Add residential complex "Al-Noor" 30 units: 15 one-bedroom with bathroom and kitchen, 15 two-bedroom with bathrooms, kitchen and living room',
      icon: Home,
    },
    {
      text: language === 'ar'
        ? 'إنشاء عقار "مجمع الياسمين" 25 وحدة في 5 طوابق مع مواقف سيارات ومكيفات'
        : 'Create property "Jasmine Complex" 25 units across 5 floors with parking and air conditioning',
      icon: Users,
    },
  ];

  const parseAIResponse = (response: string): GeneratedProperty | null => {
    try {
      // Enhanced parsing with better error handling
      if (!response || response.trim() === '') {
        console.log('Empty AI response received');
        return null;
      }

      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error('Failed to parse extracted JSON:', parseError);
        }
      }

      // Fallback: Parse using regex patterns with global flag
      const propertyNameMatch = response.match(/(?:property|عقار).*?["']([^"']+)["']/gi);
      const unitsMatch = response.match(/(\d+)\s*(?:units|وحدة|وحدات)/gi);
      const bedroomsMatch = response.match(/(\d+)\s*(?:bedroom|غرفة نوم|غرف نوم)/gi);

      if (!propertyNameMatch || !unitsMatch) {
        console.log('Could not extract basic property information');
        return null;
      }

      const propertyName = propertyNameMatch[0].replace(/(?:property|عقار).*?["']/, '').replace(/["'].*/, '');
      const totalUnits = parseInt(unitsMatch[0].match(/\d+/)?.[0] || '0');

      // Generate basic units structure
      const units: GeneratedUnit[] = [];
      for (let i = 1; i <= totalUnits; i++) {
        const floor = Math.ceil(i / 5); // 5 units per floor
        const unitNumber = ((i - 1) % 5) + 1;
        const unitLabel = `${String.fromCharCode(64 + floor)}-${unitNumber.toString().padStart(2, '0')}${i}`;
        
        // Alternate between 1BR and 2BR for variety
        const bedrooms = i % 2 === 1 ? 1 : 2;
        const bathrooms = bedrooms;
        const hasLivingRoom = bedrooms > 1;
        
        // AI-suggested pricing based on unit type
        const basePrice = bedrooms === 1 ? 2200 : bedrooms === 2 ? 3000 : 4000;
        const suggestedPrice = basePrice + (floor * 100); // Higher floors cost more

        units.push({
          id: `unit_${i}`,
          unitLabel,
          bedrooms,
          bathrooms,
          hasKitchen: true,
          hasLivingRoom,
          floor,
          sizeSqm: bedrooms === 1 ? 65 : bedrooms === 2 ? 85 : 120,
          amenities: ['مكيف', 'موقف سيارة'],
          suggestedPrice,
          isAISuggested: true,
          status: 'available',
        });
      }

      // Calculate summary
      const oneBedroomCount = units.filter(u => u.bedrooms === 1).length;
      const twoBedroomCount = units.filter(u => u.bedrooms === 2).length;
      const threeBedroomCount = units.filter(u => u.bedrooms === 3).length;
      const averagePrice = units.reduce((sum, u) => sum + u.suggestedPrice, 0) / units.length;
      const totalValue = units.reduce((sum, u) => sum + u.suggestedPrice, 0);

      return {
        name: propertyName,
        totalUnits,
        units,
        summary: {
          oneBedroomCount,
          twoBedroomCount,
          threeBedroomCount,
          averagePrice,
          totalValue,
        },
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return null;
    }
  };

  const handleVoiceTranscription = (transcribedText: string) => {
    setCommand(transcribedText);
    updateContext({ voiceCommand: transcribedText });
  };

  const handleVoiceError = (error: string) => {
    Alert.alert(
      language === 'ar' ? 'خطأ في التسجيل' : 'Recording Error',
      error
    );
  };

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    updateContext({ uploadedFiles: files });
  };

  const handleFileRemoved = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updatedFiles);
    updateContext({ uploadedFiles: updatedFiles });
  };

  const handleAIResultGenerated = (result: any) => {
    setAIResults(prev => [...prev, result]);
    
    // If it's a property generation result, parse and set the property
    if (result.type === 'property_analysis' || result.type === 'unit_generation') {
      try {
        const parsedProperty = parseAIResponse(result.content);
        if (parsedProperty) {
          setGeneratedProperty(parsedProperty);
          setShowPreview(true);
        }
      } catch (error) {
        console.error('Failed to parse AI result as property:', error);
      }
    }
  };

  const handleProcessContent = async () => {
    const hasVoiceCommand = !!command.trim();
    const hasFiles = uploadedFiles.length > 0;
    
    if (!hasVoiceCommand && !hasFiles) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى إدخال أمر صوتي أو رفع ملفات' : 'Please enter voice command or upload files'
      );
      return;
    }

    // Update context with current command
    updateContext({ voiceCommand: command });
    
    try {
      let result;
      
      if (hasVoiceCommand && hasFiles) {
        // Combined processing
        result = await generateProperty(command);
      } else if (hasVoiceCommand) {
        // Voice-only processing
        result = await generateProperty(command);
      } else if (hasFiles) {
        // File-only processing
        result = await analyzeDocuments(uploadedFiles);
      }

      if (result?.success) {
        console.log('✅ AI processing successful');
        setActiveTab('results');
      } else {
        throw new Error(result?.error || 'AI processing failed');
      }
    } catch (error) {
      console.error('AI Generation error:', error);
      Alert.alert(
        language === 'ar' ? 'خطأ في التوليد' : 'Generation Error',
        language === 'ar' ? 'فشل في معالجة المحتوى. يرجى المحاولة مرة أخرى.' : 'Failed to process content. Please try again.'
      );
    }
  };

  const handleSettingsChange = (newSettings: AISettingsConfig) => {
    console.log('⚙️ AI settings updated:', newSettings);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'voice':
        return (
          <View style={styles.tabContent}>
            <VoiceRecorder
              onTranscriptionComplete={handleVoiceTranscription}
              onError={handleVoiceError}
              isProcessing={isProcessing}
            />
            
            {/* Manual Text Input */}
            <Card style={[styles.manualInputCard, { backgroundColor: colors.surface }]}>
              <Text
                style={[
                  styles.manualInputTitle,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'أو اكتب الأمر يدوياً' : 'Or Type Command Manually'}
              </Text>
              <TextInput
                style={[
                  styles.manualInput,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                placeholder={language === 'ar' 
                  ? 'مثال: أنشئ عقار "برج الأمل" يحتوي على 20 وحدة...'
                  : 'Example: Create property "Hope Tower" with 20 units...'
                }
                placeholderTextColor={colors.textMuted}
                value={command}
                onChangeText={setCommand}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </Card>
          </View>
        );
      
      case 'files':
        return (
          <View style={styles.tabContent}>
            <FileUploader
              onFilesUploaded={handleFilesUploaded}
              onFileRemoved={handleFileRemoved}
              maxFiles={10}
              maxFileSize={50}
              disabled={isProcessing}
            />
          </View>
        );
      
      case 'results':
        return (
          <View style={styles.tabContent}>
            <AIProcessor
              voiceCommand={command}
              uploadedFiles={uploadedFiles}
              onResultGenerated={handleAIResultGenerated}
              isProcessing={isProcessing}
              onProcessingChange={() => {}}
            />
          </View>
        );
      
      default:
        return null;
    }
  };

  const renderSettingsModal = () => (
    <Modal
      visible={showSettings}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowSettings(false)}
    >
      <SafeAreaView style={[styles.settingsModal, { backgroundColor: colors.background }]}>
        <View style={[styles.settingsHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            onPress={() => setShowSettings(false)}
            style={[styles.settingsCloseButton, { backgroundColor: colors.surfaceSecondary }]}
          >
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text
            style={[
              styles.settingsTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'إنشاء العقارات بالذكاء الاصطناعي' : 'Create properties with AI'}
          </Text>
        </View>
        
        <AISettings
          onSettingsChange={handleSettingsChange}
          visible={true}
          onClose={() => setShowSettings(false)}
        />
      </SafeAreaView>
    </Modal>
  );

  const handleUseExample = (exampleText: string) => {
    setCommand(exampleText);
    updateContext({ voiceCommand: exampleText });
  };

  const handleVoiceInput = () => {
    // This is now handled by the VoiceRecorder component
    Alert.alert(
      language === 'ar' ? 'الإدخال الصوتي' : 'Voice Input',
      language === 'ar' ? 'استخدم زر التسجيل في قسم الأوامر الصوتية' : 'Use the record button in the Voice Commands section'
    );
  };

  const updateUnitPrice = (unitId: string, newPrice: number) => {
    if (!generatedProperty) return;
    
    const updatedUnits = generatedProperty.units.map(unit => 
      unit.id === unitId 
        ? { ...unit, suggestedPrice: newPrice, isAISuggested: false }
        : unit
    );
    
    // Recalculate summary
    const averagePrice = updatedUnits.reduce((sum, u) => sum + u.suggestedPrice, 0) / updatedUnits.length;
    const totalValue = updatedUnits.reduce((sum, u) => sum + u.suggestedPrice, 0);
    
    setGeneratedProperty({
      ...generatedProperty,
      units: updatedUnits,
      summary: {
        ...generatedProperty.summary,
        averagePrice,
        totalValue,
      },
    });
  };

  const handleSaveProperty = async () => {
    if (!generatedProperty) return;
    
    setIsSavingProperty(true);
    
    try {
      // Validate property data
      if (!generatedProperty.name.trim()) {
        throw new Error(language === 'ar' ? 'اسم العقار مطلوب' : 'Property name is required');
      }
      
      if (generatedProperty.units.length === 0) {
        throw new Error(language === 'ar' ? 'يجب أن يحتوي العقار على وحدة واحدة على الأقل' : 'Property must have at least one unit');
      }
      
      // Create property record
      const propertyRecord = {
        id: `property_${Date.now()}`,
        landlordId: user?.id || 'landlord1',
        name: generatedProperty.name,
        address: generatedProperty.address || '',
        city: generatedProperty.city || '',
        notes: `AI Generated Property - ${generatedProperty.totalUnits} units`,
        photos: [],
        createdAt: new Date().toISOString(),
        createdBy: user?.fullName || 'AI Assistant',
        isAIGenerated: true,
        aiGenerationData: {
          command,
          uploadedFiles: uploadedFiles.map(f => f.name),
          generatedAt: new Date().toISOString(),
        },
      };
      
      // Create unit records
      const unitRecords = generatedProperty.units.map(unit => ({
        ...unit,
        propertyId: propertyRecord.id,
        createdAt: new Date().toISOString(),
        isAIGenerated: true,
      }));
      
      // Save to storage
      const existingProperties = await AsyncStorage.getItem('savedProperties');
      const properties = existingProperties ? JSON.parse(existingProperties) : [];
      properties.push(propertyRecord);
      await AsyncStorage.setItem('savedProperties', JSON.stringify(properties));
      
      const existingUnits = await AsyncStorage.getItem('savedUnits');
      const units = existingUnits ? JSON.parse(existingUnits) : [];
      units.push(...unitRecords);
      await AsyncStorage.setItem('savedUnits', JSON.stringify(units));
      
      // Save AI generation history
      const aiHistory = {
        id: `ai_gen_${Date.now()}`,
        propertyId: propertyRecord.id,
        command,
        uploadedFiles: uploadedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })),
        generatedProperty,
        createdAt: new Date().toISOString(),
        createdBy: user?.fullName || 'User',
      };
      
      const existingHistory = await AsyncStorage.getItem('aiGenerationHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.push(aiHistory);
      await AsyncStorage.setItem('aiGenerationHistory', JSON.stringify(history));
      
      Alert.alert(
        language === 'ar' ? '🎉 تم الحفظ بنجاح' : '🎉 Successfully Saved',
        language === 'ar' 
          ? `تم حفظ عقار "${generatedProperty.name}" بنجاح مع ${generatedProperty.totalUnits} وحدة في النظام.\n\nيمكنك الآن إدارة العقار من قائمة العقارات.`
          : `Property "${generatedProperty.name}" saved successfully with ${generatedProperty.totalUnits} units to system.\n\nYou can now manage the property from the properties list.`,
        [
          {
            text: language === 'ar' ? 'عرض العقارات' : 'View Properties',
            onPress: () => {
              setGeneratedProperty(null);
              setCommand('');
              setShowPreview(false);
              // Navigate to properties list
              router.push('/(tabs)/properties');
            },
          },
          {
            text: language === 'ar' ? 'إنشاء عقار آخر' : 'Create Another',
            onPress: () => {
              setGeneratedProperty(null);
              setCommand('');
              setShowPreview(false);
              setActiveTab('voice');
            },
          },
        ]
      );
      
    } catch (error) {
      console.error('Property save error:', error);
      Alert.alert(
        language === 'ar' ? 'خطأ في الحفظ' : 'Save Error',
        error instanceof Error ? error.message : (language === 'ar' ? 'فشل في حفظ العقار' : 'Failed to save property')
      );
    } finally {
      setIsSavingProperty(false);
    }
  };

  const getCurrencySymbol = (currency: string = 'SAR') => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'AED': return 'د.إ';
      case 'SAR':
      default: return '﷼';
    }
  };

  const handleGenerateContent = () => {
    handleProcessContent();
  };

  const renderPropertyPreview = () => {
    if (!generatedProperty) return null;

    return (
      <View style={styles.previewSection}>
        {/* Property Header */}
        <Card style={[styles.propertyHeader, { backgroundColor: colors.primaryLight }]}>
          <View style={[styles.propertyHeaderContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.propertyIcon, { backgroundColor: colors.primary }]}>
              <Building2 size={32} color={colors.surface} />
            </View>
            <View style={styles.propertyInfo}>
              <Text
                style={[
                  styles.propertyName,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {generatedProperty.name}
              </Text>
              <Text
                style={[
                  styles.propertyStats,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {generatedProperty.totalUnits} {language === 'ar' ? 'وحدة' : 'units'} • {language === 'ar' ? 'متوسط السعر' : 'Avg price'} {formatCurrency(generatedProperty.summary.averagePrice)}
              </Text>
            </View>
            <View style={[styles.aiIndicator, { backgroundColor: colors.success }]}>
              <Sparkles size={16} color={colors.surface} />
              <Text style={[styles.aiIndicatorText, { color: colors.surface }]}>
                AI
              </Text>
            </View>
          </View>
        </Card>

        {/* Summary Statistics */}
        <View style={styles.summaryGrid}>
          <Card style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.primaryLight }]}>
              <Bed size={20} color={colors.primary} />
            </View>
            <Text style={[styles.summaryValue, { color: colors.textPrimary, fontFamily: 'monospace' }]}>
              {generatedProperty.summary.oneBedroomCount}
            </Text>
            <Text style={[styles.summaryLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'غرفة واحدة' : '1 Bedroom'}
            </Text>
          </Card>

          <Card style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.successLight }]}>
              <Home size={20} color={colors.success} />
            </View>
            <Text style={[styles.summaryValue, { color: colors.textPrimary, fontFamily: 'monospace' }]}>
              {generatedProperty.summary.twoBedroomCount}
            </Text>
            <Text style={[styles.summaryLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'غرفتان' : '2 Bedrooms'}
            </Text>
          </Card>

          <Card style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.warningLight }]}>
              <DollarSign size={20} color={colors.warning} />
            </View>
            <Text style={[styles.summaryValue, { color: colors.textPrimary, fontFamily: 'monospace' }]}>
              {formatCurrency(generatedProperty.summary.totalValue)}
            </Text>
            <Text style={[styles.summaryLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'إجمالي القيمة' : 'Total Value'}
            </Text>
          </Card>
        </View>

        {/* Units Table */}
        <Card style={[styles.unitsTable, { backgroundColor: colors.surface }]}>
          <View style={[styles.tableHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.tableTitle, { 
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold' 
            }]}>
              {language === 'ar' ? 'تفاصيل الوحدات' : 'Unit Details'}
            </Text>
            <TouchableOpacity
              style={[styles.toggleButton, { backgroundColor: colors.primaryLight }]}
              onPress={() => setShowPreview(!showPreview)}
            >
              <Eye size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {showPreview && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.table}>
                {/* Table Headers */}
                <View style={[styles.tableRow, styles.tableHeaderRow, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.tableCell, styles.tableHeaderCell, { fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold' }]}>
                    {language === 'ar' ? 'الوحدة' : 'Unit'}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell, { fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold' }]}>
                    {language === 'ar' ? 'النوع' : 'Type'}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell, { fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold' }]}>
                    {language === 'ar' ? 'الطابق' : 'Floor'}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell, { fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold' }]}>
                    {language === 'ar' ? 'المساحة' : 'Size'}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell, { fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold' }]}>
                    {language === 'ar' ? 'السعر المقترح' : 'Suggested Price'}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell, { fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold' }]}>
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </Text>
                </View>

                {/* Table Rows */}
                {generatedProperty.units.map((unit) => (
                  <View key={unit.id} style={[styles.tableRow, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.tableCell, { 
                      color: colors.primary,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold' 
                    }]}>
                      {unit.unitLabel}
                    </Text>
                    <Text style={[styles.tableCell, { 
                      color: colors.textPrimary,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
                    }]}>
                      {unit.bedrooms}{language === 'ar' ? 'غ' : 'BR'} • {unit.bathrooms}{language === 'ar' ? 'ح' : 'BA'}
                    </Text>
                    <Text style={[styles.tableCell, { 
                      color: colors.textSecondary,
                      fontFamily: 'monospace' 
                    }]}>
                      {unit.floor}
                    </Text>
                    <Text style={[styles.tableCell, { 
                      color: colors.textSecondary,
                      fontFamily: 'monospace' 
                    }]}>
                      {unit.sizeSqm}{language === 'ar' ? 'م²' : 'sqm'}
                    </Text>
                    <TouchableOpacity
                      style={[styles.priceCell, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                      onPress={() => setEditingUnit(editingUnit === unit.id ? null : unit.id)}
                    >
                      {editingUnit === unit.id ? (
                        <TextInput
                          style={[styles.priceInput, { 
                            color: colors.textPrimary,
                            fontFamily: 'monospace' 
                          }]}
                          value={unit.suggestedPrice.toString()}
                          onChangeText={(text) => {
                            const newPrice = parseInt(text) || 0;
                            updateUnitPrice(unit.id, newPrice);
                          }}
                          keyboardType="numeric"
                          onBlur={() => setEditingUnit(null)}
                          autoFocus
                        />
                      ) : (
                        <View style={[styles.priceDisplay, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                          <Text style={[styles.priceText, { 
                            color: unit.isAISuggested ? colors.success : colors.textPrimary,
                            fontFamily: 'monospace' 
                          }]}>
                            {formatCurrency(unit.suggestedPrice)}
                          </Text>
                          {unit.isAISuggested && (
                            <View style={[styles.aiPriceBadge, { backgroundColor: colors.successLight }]}>
                              <Sparkles size={10} color={colors.success} />
                            </View>
                          )}
                          <Edit3 size={12} color={colors.textMuted} />
                        </View>
                      )}
                    </TouchableOpacity>
                    <StatusChip status="available" size="sm" />
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </Card>

        {/* Save Actions */}
        <View style={styles.saveActions}>
          <Button
            title={isSavingProperty 
              ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
              : (language === 'ar' ? 'حفظ العقار' : 'Save Property')
            }
            onPress={handleSaveProperty}
            disabled={isSavingProperty}
            variant="primary"
          />
          <Button
            title={language === 'ar' ? 'إعادة التوليد' : 'Regenerate'}
            onPress={() => {
              setGeneratedProperty(null);
              setShowPreview(false);
              handleGenerateContent();
            }}
            disabled={isSavingProperty}
            variant="secondary"
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={[styles.headerContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.headerLeft, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'مساعد الذكاء الاصطناعي' : 'AI Assistant'}
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'استخدم الصوت والملفات لإنشاء العقارات' : 'Use voice and files to create properties'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerActionButton, { backgroundColor: colors.primaryLight }]}
              onPress={() => setShowSettings(true)}
              activeOpacity={0.7}
            >
              <Settings size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabNavigation, { backgroundColor: colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          <View style={[styles.tabButtons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabButton,
                  {
                    backgroundColor: activeTab === tab.id ? tab.color : colors.surfaceSecondary,
                  },
                ]}
                onPress={() => setActiveTab(tab.id as any)}
                activeOpacity={0.8}
              >
                <tab.icon 
                  size={20} 
                  color={activeTab === tab.id ? colors.surface : tab.color} 
                />
                <Text
                  style={[
                    styles.tabButtonText,
                    {
                      color: activeTab === tab.id ? colors.surface : tab.color,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tab Content */}
        {renderTabContent()}

        {/* Process Button */}
        {(command.trim() || uploadedFiles.length > 0) && (
          <View style={styles.processButtonContainer}>
            <Button
              title={isProcessing 
                ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...') 
                : (language === 'ar' ? 'معالجة بالذكاء الاصطناعي' : 'Process with AI')
              }
              onPress={handleProcessContent}
              disabled={isProcessing}
              variant="primary"
              style={styles.processButton}
            />
          </View>
        )}

        {/* Generated Property Preview */}
        {generatedProperty && renderPropertyPreview()}
      </ScrollView>

      {/* Settings Modal */}
      {renderSettingsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContent: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerActionButton: {
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
  tabNavigation: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabScroll: {
    flexGrow: 0,
  },
  tabButtons: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabButtonText: {
    fontSize: fontSize.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  tabContent: {
    gap: spacing.lg,
  },
  manualInputCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.card,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  manualInputTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  manualInput: {
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    fontSize: fontSize.md,
    minHeight: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  processButtonContainer: {
    padding: spacing.md,
  },
  processButton: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  settingsModal: {
    flex: 1,
  },
  settingsHeader: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 167, 113, 0.2)',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  settingsCloseButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  settingsTitle: {
    fontSize: fontSize.xl,
    flex: 1,
  },
  previewSection: {
    gap: spacing.lg,
  },
  propertyHeader: {
    elevation: 3,
    borderRadius: borderRadius.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#4CA771',
  },
  propertyHeaderContent: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  propertyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
  },
  propertyStats: {
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  aiIndicatorText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  summaryValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  unitsTable: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  tableHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  tableTitle: {
    fontSize: fontSize.lg,
  },
  toggleButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  table: {
    minWidth: 800,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tableHeaderRow: {
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(76, 167, 113, 0.2)',
  },
  tableCell: {
    flex: 1,
    fontSize: fontSize.sm,
    paddingHorizontal: spacing.xs,
    minWidth: 80,
  },
  tableHeaderCell: {
    fontWeight: '600',
    color: '#4CA771',
  },
  priceCell: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    minWidth: 120,
  },
  priceDisplay: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  priceText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#4CA771',
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    fontSize: fontSize.sm,
    textAlign: 'center',
    minWidth: 80,
  },
  aiPriceBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});