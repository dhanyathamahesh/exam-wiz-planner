import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, difficulty, numQuestions, grade } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert quiz creator for educational content. 
Generate high-quality multiple-choice questions appropriate for the given grade level and subject.
Each question should have 4 options (A, B, C, D) with exactly one correct answer and a clear explanation.`;

    const userPrompt = `Create ${numQuestions} ${difficulty} difficulty multiple-choice questions for:
- Subject: ${subject}
- Grade: ${grade}

Return as a JSON object with this structure:
{
  "questions": [
    {
      "question": "Question text",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctAnswer": "A",
      "explanation": "Why this answer is correct"
    }
  ]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'create_quiz',
            description: 'Create a quiz with multiple choice questions',
            parameters: {
              type: 'object',
              properties: {
                questions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      question: { type: 'string' },
                      options: {
                        type: 'object',
                        properties: {
                          A: { type: 'string' },
                          B: { type: 'string' },
                          C: { type: 'string' },
                          D: { type: 'string' }
                        },
                        required: ['A', 'B', 'C', 'D']
                      },
                      correctAnswer: { type: 'string' },
                      explanation: { type: 'string' }
                    },
                    required: ['question', 'options', 'correctAnswer', 'explanation']
                  }
                }
              },
              required: ['questions']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'create_quiz' } }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI API Error:', error);
      throw new Error('Failed to generate quiz');
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No quiz generated');
    }

    const quiz = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(quiz), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});