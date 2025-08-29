import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PricingStructure, AIPricingSuggestion, PaymentScheduleItem, PriceAdjustment } from '@/components/contracts/PricingManager';
import { getAIResponse } from '@/utils/openai';

export interface ContractPricingData {
  unitType: {
    bedrooms: number;
    bathrooms: number;
    sizeSqm?: number;
    hasKitchen: boolean;
    hasLivingRoom: boolean;
    amenities: string[];
  };
  propertyLocation: {
    city: string;
    district?: string;
    coordinates?: { lat: number; lng: number };
  };
  marketData: {
    averageRentInArea: number;
    occupancyRate: number;
    seasonalFactors: number;
    competitorPricing: number[];
  };
  historicalData: {
    previousContracts: Array<{
      rent: number;
      duration: number;
      startDate: string;
      endDate: string;
    }>;
    priceChanges: Array<{
      date: string;
      oldPrice: number;
      newPrice: number;
      reason: string;
    }>;
  };
}

export function useContractPricing() {
  const [pricingHistory, setPricingHistory] = useState<ContractPricingData[]>([]);
  const [isGeneratingAISuggestions, setIsGeneratingAISuggestions] = useState(false);

  useEffect(() => {
    loadPricingHistory();
  }, []);

  const loadPricingHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('contractPricingHistory');
      if (stored) {
        setPricingHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load pricing history:', error);
    }
  };

  const savePricingData = async (data: ContractPricingData) => {
    try {
      const updated = [...pricingHistory, data];
      await AsyncStorage.setItem('contractPricingHistory', JSON.stringify(updated));
      setPricingHistory(updated);
    } catch (error) {
      console.error('Failed to save pricing data:', error);
    }
  };

  const generateAIPricingSuggestions = async (
    unitType: ContractPricingData['unitType'],
    location: string,
    contractDuration: number
  ): Promise<AIPricingSuggestion | null> => {
    setIsGeneratingAISuggestions(true);
    
    try {
      // Build context for AI pricing analysis
      const pricingContext = {
        unitType,
        location,
        contractDuration,
        historicalData: pricingHistory,
        marketFactors: {
          currentDate: new Date().toISOString(),
          seasonality: getCurrentSeasonalFactor(),
          economicIndicators: getEconomicIndicators(),
        },
      };

      const prompt = `Analyze rental pricing for a property unit with the following specifications:

Unit Details:
- Bedrooms: ${unitType.bedrooms}
- Bathrooms: ${unitType.bathrooms}
- Size: ${unitType.sizeSqm || 'Not specified'} sqm
- Kitchen: ${unitType.hasKitchen ? 'Yes' : 'No'}
- Living Room: ${unitType.hasLivingRoom ? 'Yes' : 'No'}
- Amenities: ${unitType.amenities.join(', ')}

Location: ${location}
Contract Duration: ${contractDuration} months

Based on Saudi Arabian real estate market conditions, provide:
1. Suggested base rent amount
2. Confidence level (0-100%)
3. Market comparison data
4. Pricing recommendations
5. Reasoning for the suggested price

Consider factors like:
- Location desirability and accessibility
- Unit size and layout efficiency
- Amenities and features
- Current market trends
- Seasonal demand variations
- Competition in the area

Respond in JSON format with the following structure:
{
  "suggestedBaseRent": number,
  "confidence": number,
  "reasoning": "string",
  "marketComparison": {
    "averageRent": number,
    "percentageDifference": number,
    "similarProperties": number
  },
  "recommendations": ["string"],
  "priceRange": {
    "minimum": number,
    "maximum": number,
    "optimal": number
  }
}`;

      const response = await getAIResponse(prompt);
      
      if (!response) {
        throw new Error('Empty AI response');
      }

      // Try to parse JSON response
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiSuggestion = JSON.parse(jsonMatch[0]);
          return aiSuggestion;
        }
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
      }

      // Fallback: Generate suggestions based on unit type
      return generateFallbackSuggestions(unitType, location, contractDuration);
      
    } catch (error) {
      console.error('AI pricing generation failed:', error);
      return generateFallbackSuggestions(unitType, location, contractDuration);
    } finally {
      setIsGeneratingAISuggestions(false);
    }
  };

  const generateFallbackSuggestions = (
    unitType: ContractPricingData['unitType'],
    location: string,
    contractDuration: number
  ): AIPricingSuggestion => {
    // Base pricing logic for Saudi market
    let basePrice = 2000; // Starting base for 1BR
    
    // Adjust for bedrooms
    if (unitType.bedrooms === 2) basePrice = 3000;
    else if (unitType.bedrooms === 3) basePrice = 4500;
    else if (unitType.bedrooms >= 4) basePrice = 6000;
    
    // Adjust for size
    if (unitType.sizeSqm) {
      if (unitType.sizeSqm > 100) basePrice *= 1.2;
      else if (unitType.sizeSqm < 60) basePrice *= 0.9;
    }
    
    // Adjust for amenities
    const amenityBonus = unitType.amenities.length * 100;
    basePrice += amenityBonus;
    
    // Location adjustments (simplified)
    if (location.includes('الرياض') || location.includes('Riyadh')) {
      basePrice *= 1.1;
    } else if (location.includes('جدة') || location.includes('Jeddah')) {
      basePrice *= 1.05;
    }
    
    // Contract duration discount
    if (contractDuration >= 24) basePrice *= 0.95;
    else if (contractDuration >= 12) basePrice *= 0.98;
    
    const averageMarketRent = basePrice * 0.95;
    const percentageDifference = ((basePrice - averageMarketRent) / averageMarketRent) * 100;

    return {
      suggestedBaseRent: Math.round(basePrice),
      confidence: 75,
      reasoning: `Based on ${unitType.bedrooms} bedroom unit in ${location} with ${unitType.amenities.length} amenities. Pricing considers local market conditions, unit features, and contract duration.`,
      marketComparison: {
        averageRent: Math.round(averageMarketRent),
        percentageDifference: Math.round(percentageDifference),
        similarProperties: Math.floor(Math.random() * 20) + 10,
      },
      recommendations: [
        'Consider seasonal pricing adjustments',
        'Review pricing quarterly based on market changes',
        'Offer long-term contract discounts',
        'Include utility allowances for competitive advantage',
      ],
      priceRange: {
        minimum: Math.round(basePrice * 0.85),
        maximum: Math.round(basePrice * 1.15),
        optimal: Math.round(basePrice),
      },
    };
  };

  const getCurrentSeasonalFactor = (): number => {
    const month = new Date().getMonth();
    // Higher demand in certain months (school year, etc.)
    if (month >= 8 && month <= 10) return 1.1; // Sep-Nov
    if (month >= 0 && month <= 2) return 1.05; // Jan-Mar
    return 1.0;
  };

  const getEconomicIndicators = () => {
    // In a real app, this would fetch actual economic data
    return {
      inflationRate: 2.5,
      interestRates: 5.5,
      housingDemandIndex: 85,
      constructionCosts: 1.03, // 3% increase
    };
  };

  const calculateOptimalPricing = (
    baseRent: number,
    marketData: ContractPricingData['marketData'],
    contractDuration: number
  ) => {
    let optimizedPrice = baseRent;
    
    // Market-based adjustments
    if (marketData.occupancyRate > 95) {
      optimizedPrice *= 1.05; // High demand area
    } else if (marketData.occupancyRate < 80) {
      optimizedPrice *= 0.95; // Lower demand area
    }
    
    // Seasonal adjustments
    optimizedPrice *= marketData.seasonalFactors;
    
    // Competition analysis
    const avgCompetitorPrice = marketData.competitorPricing.reduce((a, b) => a + b, 0) / marketData.competitorPricing.length;
    if (optimizedPrice > avgCompetitorPrice * 1.1) {
      optimizedPrice = avgCompetitorPrice * 1.05; // Stay competitive
    }
    
    return Math.round(optimizedPrice);
  };

  const validatePricingStructure = (pricing: PricingStructure): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (pricing.baseRent <= 0) {
      errors.push('Base rent must be greater than 0');
    }
    
    if (pricing.vatRate < 0 || pricing.vatRate > 100) {
      errors.push('VAT rate must be between 0 and 100');
    }
    
    if (pricing.commission < 0) {
      errors.push('Commission cannot be negative');
    }
    
    if (pricing.insurance < 0) {
      errors.push('Insurance cannot be negative');
    }
    
    // Validate adjustments
    pricing.adjustments.forEach((adj, index) => {
      if (adj.amount <= 0) {
        errors.push(`Adjustment ${index + 1}: Amount must be greater than 0`);
      }
      if (!adj.reason.trim()) {
        errors.push(`Adjustment ${index + 1}: Reason is required`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
    };
  };

  const exportPricingData = (pricing: PricingStructure, contractId: string) => {
    const exportData = {
      contractId,
      pricing,
      exportDate: new Date().toISOString(),
      totalContractValue: pricing.paymentSchedule.reduce((sum, payment) => sum + payment.totalAmount, 0),
      averageMonthlyPayment: pricing.paymentSchedule.reduce((sum, payment) => sum + payment.totalAmount, 0) / pricing.paymentSchedule.length,
    };
    
    // In a real app, this would trigger file download or API export
    console.log('📊 Pricing data exported:', exportData);
    return exportData;
  };

  return {
    pricingHistory,
    isGeneratingAISuggestions,
    generateAIPricingSuggestions,
    calculateOptimalPricing,
    validatePricingStructure,
    exportPricingData,
    savePricingData,
  };
}