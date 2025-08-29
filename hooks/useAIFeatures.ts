import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAIResponse } from '@/utils/openai';
import { UploadedFile } from '@/components/ai/FileUploader';
import { AISettingsConfig } from '@/components/ai/AISettings';

export interface AIContext {
  voiceCommand?: string;
  uploadedFiles: UploadedFile[];
  previousResults: any[];
  userPreferences: {
    language: string;
    currency: string;
    propertyTypes: string[];
  };
}

export interface AICapability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  requiresFiles: boolean;
  requiresVoice: boolean;
  supportedLanguages: string[];
}

export function useAIFeatures() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [context, setContext] = useState<AIContext>({
    uploadedFiles: [],
    previousResults: [],
    userPreferences: {
      language: 'ar',
      currency: 'SAR',
      propertyTypes: ['residential', 'commercial'],
    },
  });
  const [settings, setSettings] = useState<AISettingsConfig | null>(null);
  const [capabilities, setCapabilities] = useState<AICapability[]>([]);

  useEffect(() => {
    initializeAIFeatures();
  }, []);

  const initializeAIFeatures = async () => {
    try {
      // Load AI settings
      const storedSettings = await AsyncStorage.getItem('aiSettings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }

      // Initialize AI capabilities
      const defaultCapabilities: AICapability[] = [
        {
          id: 'property_generation',
          name: 'Property Generation',
          description: 'Generate property structures from voice commands',
          enabled: true,
          requiresFiles: false,
          requiresVoice: true,
          supportedLanguages: ['ar', 'en'],
        },
        {
          id: 'document_analysis',
          name: 'Document Analysis',
          description: 'Analyze uploaded property documents',
          enabled: true,
          requiresFiles: true,
          requiresVoice: false,
          supportedLanguages: ['ar', 'en'],
        },
        {
          id: 'price_optimization',
          name: 'Price Optimization',
          description: 'Suggest optimal pricing based on market data',
          enabled: true,
          requiresFiles: false,
          requiresVoice: false,
          supportedLanguages: ['ar', 'en'],
        },
        {
          id: 'contract_generation',
          name: 'Contract Generation',
          description: 'Generate rental contracts from property data',
          enabled: true,
          requiresFiles: true,
          requiresVoice: true,
          supportedLanguages: ['ar', 'en'],
        },
        {
          id: 'maintenance_scheduling',
          name: 'Maintenance Scheduling',
          description: 'AI-powered maintenance planning',
          enabled: false,
          requiresFiles: false,
          requiresVoice: true,
          supportedLanguages: ['ar', 'en'],
        },
      ];

      setCapabilities(defaultCapabilities);
      console.log('🤖 AI features initialized');
    } catch (error) {
      console.error('Failed to initialize AI features:', error);
    }
  };

  const updateContext = useCallback((updates: Partial<AIContext>) => {
    setContext(prev => ({ ...prev, ...updates }));
  }, []);

  const processWithAI = async (
    prompt: string,
    options: {
      includeFiles?: boolean;
      includeContext?: boolean;
      capability?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ) => {
    setIsProcessing(true);
    
    try {
      // Build enhanced prompt with context
      let enhancedPrompt = prompt;
      
      if (options.includeContext && context.voiceCommand) {
        enhancedPrompt += `\n\nVoice Command Context: ${context.voiceCommand}`;
      }
      
      if (options.includeFiles && context.uploadedFiles.length > 0) {
        const fileContext = context.uploadedFiles
          .filter(f => f.extractedText)
          .map(f => `File: ${f.name}\nContent: ${f.extractedText}`)
          .join('\n\n');
        
        if (fileContext) {
          enhancedPrompt += `\n\nFile Context:\n${fileContext}`;
        }
      }

      // Add user preferences
      enhancedPrompt += `\n\nUser Preferences:
        - Language: ${context.userPreferences.language}
        - Currency: ${context.userPreferences.currency}
        - Property Types: ${context.userPreferences.propertyTypes.join(', ')}`;

      const systemMessage = `You are an expert real estate AI assistant specializing in property management for the Saudi Arabian market. 

      Key capabilities:
      - Property structure generation and optimization
      - Unit pricing analysis and suggestions
      - Document analysis and data extraction
      - Market trend analysis
      - Rental contract generation
      - Maintenance scheduling recommendations

      Always respond in ${context.userPreferences.language === 'ar' ? 'Arabic' : 'English'} and consider local market conditions, regulations, and cultural preferences.

      For property generation, include:
      - Realistic unit distributions
      - Market-appropriate pricing in ${context.userPreferences.currency}
      - Local amenities and features
      - Compliance with Saudi building codes
      - Cultural considerations for family units

      Format responses as structured JSON when generating properties, or as detailed analysis for other tasks.`;

      const response = await getAIResponse(enhancedPrompt, systemMessage);
      
      if (!response) {
        throw new Error('Empty response from AI service');
      }

      // Store result in context for future reference
      const newResult = {
        id: `result_${Date.now()}`,
        prompt: enhancedPrompt,
        response,
        timestamp: new Date().toISOString(),
        capability: options.capability,
      };

      setContext(prev => ({
        ...prev,
        previousResults: [...prev.previousResults, newResult],
      }));

      return {
        success: true,
        response,
        metadata: {
          processingTime: Date.now(),
          tokensUsed: response.length,
          capability: options.capability,
        },
      };
    } catch (error) {
      console.error('AI processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const generateProperty = async (description: string) => {
    const result = await processWithAI(
      `Generate a detailed property structure based on this description: ${description}`,
      {
        includeFiles: true,
        includeContext: true,
        capability: 'property_generation',
        temperature: 0.7,
        maxTokens: 2000,
      }
    );

    return result;
  };

  const analyzeDocuments = async (files: UploadedFile[]) => {
    if (files.length === 0) {
      return { success: false, error: 'No files to analyze' };
    }

    const fileDescriptions = files
      .map(f => `File: ${f.name} (${f.type}) - ${f.extractedText || 'No text extracted'}`)
      .join('\n');

    const result = await processWithAI(
      `Analyze these property-related documents and extract key information:\n\n${fileDescriptions}`,
      {
        includeContext: true,
        capability: 'document_analysis',
        temperature: 0.3,
        maxTokens: 1500,
      }
    );

    return result;
  };

  const optimizePricing = async (propertyData: any) => {
    const result = await processWithAI(
      `Analyze and optimize pricing for this property data: ${JSON.stringify(propertyData)}`,
      {
        includeContext: true,
        capability: 'price_optimization',
        temperature: 0.4,
        maxTokens: 1000,
      }
    );

    return result;
  };

  const generateContract = async (propertyData: any, tenantData: any) => {
    const result = await processWithAI(
      `Generate a rental contract for this property and tenant data:
      Property: ${JSON.stringify(propertyData)}
      Tenant: ${JSON.stringify(tenantData)}`,
      {
        includeFiles: true,
        includeContext: true,
        capability: 'contract_generation',
        temperature: 0.2,
        maxTokens: 3000,
      }
    );

    return result;
  };

  const getCapabilityStatus = (capabilityId: string) => {
    const capability = capabilities.find(c => c.id === capabilityId);
    return capability?.enabled || false;
  };

  const toggleCapability = async (capabilityId: string) => {
    const updatedCapabilities = capabilities.map(cap =>
      cap.id === capabilityId ? { ...cap, enabled: !cap.enabled } : cap
    );
    
    setCapabilities(updatedCapabilities);
    
    try {
      await AsyncStorage.setItem('aiCapabilities', JSON.stringify(updatedCapabilities));
    } catch (error) {
      console.error('Failed to save AI capabilities:', error);
    }
  };

  const clearContext = () => {
    setContext({
      uploadedFiles: [],
      previousResults: [],
      userPreferences: context.userPreferences,
    });
  };

  const exportContext = async () => {
    try {
      const contextData = {
        ...context,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };
      
      // In a real app, this would trigger a file download
      console.log('📤 Context exported:', contextData);
      return { success: true, data: contextData };
    } catch (error) {
      console.error('Failed to export context:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  return {
    context,
    settings,
    capabilities,
    isProcessing,
    updateContext,
    processWithAI,
    generateProperty,
    analyzeDocuments,
    optimizePricing,
    generateContract,
    getCapabilityStatus,
    toggleCapability,
    clearContext,
    exportContext,
  };
}