interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}


// Helper function for simple text completion
export async function getAIResponse(
  prompt: string,
  systemMessage?: string
): Promise<string> {
  console.log('AI features running in Expo Go - returning mock response');
  return generateMockAIResponse(prompt);
}

// Mock AI response for Expo Go compatibility
function generateMockAIResponse(prompt: string): string {
  if (prompt.includes('property') || prompt.includes('عقار')) {
    return `{
      "name": "Demo Property",
      "totalUnits": 20,
      "units": [
        {
          "id": "unit_1",
          "unitLabel": "A-101",
          "bedrooms": 2,
          "bathrooms": 1,
          "hasKitchen": true,
          "hasLivingRoom": true,
          "floor": 1,
          "sizeSqm": 85,
          "amenities": ["مكيف", "موقف سيارة"],
          "suggestedPrice": 2500,
          "isAISuggested": true,
          "status": "available"
        }
      ],
      "summary": {
        "oneBedroomCount": 8,
        "twoBedroomCount": 10,
        "threeBedroomCount": 2,
        "averagePrice": 2800,
        "totalValue": 56000
      }
    }`;
  }
  
  return 'Mock AI response for Expo Go compatibility';
}