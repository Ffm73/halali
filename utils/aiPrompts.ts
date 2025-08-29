import { Language, Currency } from '@/types';
import { UploadedFile } from '@/components/ai/FileUploader';

export interface PromptContext {
  language: Language;
  currency: Currency;
  userRole: 'landlord' | 'resident' | 'staff';
  previousResults?: any[];
  uploadedFiles?: UploadedFile[];
  voiceCommand?: string;
}

export class AIPromptBuilder {
  private context: PromptContext;

  constructor(context: PromptContext) {
    this.context = context;
  }

  buildPropertyGenerationPrompt(description: string): string {
    const systemPrompt = this.getSystemPrompt('property_generation');
    const contextPrompt = this.buildContextPrompt();
    
    return `${systemPrompt}

${contextPrompt}

User Request: ${description}

Please generate a comprehensive property structure with realistic Saudi Arabian market considerations.`;
  }

  buildDocumentAnalysisPrompt(files: UploadedFile[]): string {
    const systemPrompt = this.getSystemPrompt('document_analysis');
    const contextPrompt = this.buildContextPrompt();
    
    const fileDescriptions = files
      .map(f => `File: ${f.name} (${f.type})\nExtracted Content: ${f.extractedText || 'No text extracted'}`)
      .join('\n\n');

    return `${systemPrompt}

${contextPrompt}

Documents to Analyze:
${fileDescriptions}

Please provide a comprehensive analysis of these property-related documents.`;
  }

  buildPriceOptimizationPrompt(propertyData: any): string {
    const systemPrompt = this.getSystemPrompt('price_optimization');
    const contextPrompt = this.buildContextPrompt();
    
    return `${systemPrompt}

${contextPrompt}

Property Data for Pricing Analysis:
${JSON.stringify(propertyData, null, 2)}

Please analyze and provide optimized pricing recommendations.`;
  }

  buildContractGenerationPrompt(propertyData: any, tenantData: any): string {
    const systemPrompt = this.getSystemPrompt('contract_generation');
    const contextPrompt = this.buildContextPrompt();
    
    return `${systemPrompt}

${contextPrompt}

Property Information:
${JSON.stringify(propertyData, null, 2)}

Tenant Information:
${JSON.stringify(tenantData, null, 2)}

Please generate a comprehensive rental contract in ${this.context.language === 'ar' ? 'Arabic' : 'English'}.`;
  }

  buildMaintenanceSchedulingPrompt(propertyData: any, maintenanceHistory?: any[]): string {
    const systemPrompt = this.getSystemPrompt('maintenance_scheduling');
    const contextPrompt = this.buildContextPrompt();
    
    return `${systemPrompt}

${contextPrompt}

Property Data:
${JSON.stringify(propertyData, null, 2)}

${maintenanceHistory ? `Maintenance History:\n${JSON.stringify(maintenanceHistory, null, 2)}` : ''}

Please create an optimized maintenance schedule and recommendations.`;
  }

  private getSystemPrompt(capability: string): string {
    const basePrompt = `You are an expert AI assistant specializing in Saudi Arabian real estate management. You have deep knowledge of:

- Local property laws and regulations
- Market pricing and trends
- Cultural preferences and requirements
- Building codes and standards
- Rental market dynamics
- Property management best practices

Always respond in ${this.context.language === 'ar' ? 'Arabic' : 'English'} and consider:
- Local market conditions
- Cultural sensitivities
- Religious considerations (prayer rooms, gender-separated facilities)
- Family-oriented housing needs
- Saudi Vision 2030 development goals
- RERA (Real Estate Regulatory Authority) compliance`;

    const capabilityPrompts = {
      property_generation: `${basePrompt}

For property generation tasks:
- Create realistic unit distributions based on Saudi family sizes
- Suggest appropriate amenities for the local market
- Include prayer rooms and family-friendly features
- Consider parking requirements (typically 1-2 spaces per unit)
- Factor in local building materials and construction methods
- Suggest pricing in ${this.context.currency} based on current market rates
- Include compliance with Saudi building codes

Respond with structured JSON for property data, including:
- Property name and location details
- Unit breakdown with realistic labels
- Pricing suggestions with market justification
- Amenities and features list
- Compliance notes`,

      document_analysis: `${basePrompt}

For document analysis tasks:
- Extract key property information from uploaded documents
- Identify unit specifications, pricing, and terms
- Flag any compliance issues or missing information
- Summarize financial projections and ROI calculations
- Note any cultural or religious considerations mentioned
- Highlight maintenance and operational requirements

Provide structured analysis with:
- Executive summary
- Key findings and metrics
- Recommendations for improvement
- Compliance checklist
- Risk assessment`,

      price_optimization: `${basePrompt}

For pricing optimization:
- Analyze current Saudi real estate market trends
- Consider location-specific factors (proximity to mosques, schools, malls)
- Factor in seasonal demand variations
- Include utility costs and service charges
- Consider competition analysis
- Account for expatriate vs. local preferences
- Include Hajj/Umrah seasonal pricing for Mecca/Medina properties

Provide pricing recommendations with:
- Market analysis justification
- Seasonal adjustment suggestions
- Competitive positioning
- Revenue optimization strategies`,

      contract_generation: `${basePrompt}

For contract generation:
- Include all required legal clauses per Saudi law
- Add Islamic finance compliance where applicable
- Include cultural considerations and family clauses
- Specify utility arrangements and limits
- Include maintenance and repair responsibilities
- Add dispute resolution procedures
- Include early termination conditions

Generate complete contracts with:
- All legal requirements
- Clear Arabic/English terms
- Cultural sensitivity
- RERA compliance
- Islamic law considerations`,

      maintenance_scheduling: `${basePrompt}

For maintenance scheduling:
- Consider Saudi climate conditions (extreme heat, sandstorms)
- Plan around religious holidays and prayer times
- Include preventive maintenance for AC systems (critical in Saudi)
- Schedule deep cleaning before Ramadan and Eid
- Plan exterior maintenance to avoid summer heat
- Include pool and recreational facility maintenance
- Consider water system maintenance (critical resource)

Provide maintenance plans with:
- Seasonal scheduling
- Priority-based task organization
- Cost estimates in ${this.context.currency}
- Vendor recommendations
- Emergency response procedures`,
    };

    return capabilityPrompts[capability as keyof typeof capabilityPrompts] || basePrompt;
  }

  private buildContextPrompt(): string {
    let contextPrompt = `User Context:
- Role: ${this.context.userRole}
- Language: ${this.context.language}
- Currency: ${this.context.currency}`;

    if (this.context.uploadedFiles && this.context.uploadedFiles.length > 0) {
      contextPrompt += `\n- Uploaded Files: ${this.context.uploadedFiles.length} files`;
    }

    if (this.context.voiceCommand) {
      contextPrompt += `\n- Voice Command: "${this.context.voiceCommand}"`;
    }

    if (this.context.previousResults && this.context.previousResults.length > 0) {
      contextPrompt += `\n- Previous Results: ${this.context.previousResults.length} previous interactions`;
    }

    return contextPrompt;
  }

  static createQuickPrompts(language: Language): Array<{ category: string; prompts: string[] }> {
    if (language === 'ar') {
      return [
        {
          category: 'إنشاء العقارات',
          prompts: [
            'أنشئ عقار سكني بـ 30 وحدة في الرياض',
            'مجمع تجاري بـ 15 محل في جدة',
            'برج سكني فاخر بـ 50 وحدة مع مرافق',
            'مجمع عائلي بوحدات متنوعة',
          ],
        },
        {
          category: 'تحليل الأسعار',
          prompts: [
            'حلل أسعار السوق للوحدات السكنية',
            'اقترح أسعار تنافسية للعقار',
            'احسب العائد على الاستثمار',
            'قارن الأسعار مع المنافسين',
          ],
        },
        {
          category: 'إدارة العقود',
          prompts: [
            'أنشئ عقد إيجار سكني',
            'عقد إيجار تجاري مفصل',
            'شروط وأحكام الإيجار',
            'عقد صيانة شامل',
          ],
        },
      ];
    } else {
      return [
        {
          category: 'Property Creation',
          prompts: [
            'Create residential property with 30 units in Riyadh',
            'Commercial complex with 15 shops in Jeddah',
            'Luxury residential tower with 50 units and amenities',
            'Family complex with diverse unit types',
          ],
        },
        {
          category: 'Price Analysis',
          prompts: [
            'Analyze market prices for residential units',
            'Suggest competitive pricing for property',
            'Calculate return on investment',
            'Compare prices with competitors',
          ],
        },
        {
          category: 'Contract Management',
          prompts: [
            'Generate residential lease contract',
            'Detailed commercial lease agreement',
            'Rental terms and conditions',
            'Comprehensive maintenance contract',
          ],
        },
      ];
    }
  }

  static validatePrompt(prompt: string, minLength: number = 10): { valid: boolean; error?: string } {
    if (!prompt || prompt.trim().length < minLength) {
      return {
        valid: false,
        error: `Prompt must be at least ${minLength} characters long`,
      };
    }

    // Check for potentially harmful content
    const harmfulPatterns = [
      /delete|remove|destroy/i,
      /hack|exploit|vulnerability/i,
      /personal.*information|private.*data/i,
    ];

    for (const pattern of harmfulPatterns) {
      if (pattern.test(prompt)) {
        return {
          valid: false,
          error: 'Prompt contains potentially harmful content',
        };
      }
    }

    return { valid: true };
  }

  static optimizePrompt(prompt: string, context: PromptContext): string {
    let optimized = prompt.trim();

    // Add context-specific enhancements
    if (context.userRole === 'landlord') {
      optimized += '\n\nFocus on: Property management, revenue optimization, tenant satisfaction';
    } else if (context.userRole === 'resident') {
      optimized += '\n\nFocus on: Tenant rights, payment options, maintenance requests';
    } else if (context.userRole === 'staff') {
      optimized += '\n\nFocus on: Operational efficiency, task management, reporting';
    }

    // Add currency context
    optimized += `\n\nAll pricing should be in ${context.currency}`;

    // Add language context
    if (context.language === 'ar') {
      optimized += '\n\nRespond in Arabic with cultural sensitivity';
    }

    return optimized;
  }
}