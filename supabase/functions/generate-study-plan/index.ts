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
    const { grade, targetExam, startDate, endDate, weakSubjects } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert educational AI that creates personalized study plans for students. 
Create a comprehensive study plan with specific daily tasks, resources to review, and time allocations.
Focus on the exam-specific weightages and prioritize weak subjects.`;

    const userPrompt = `Create a detailed study plan for:
- Grade: ${grade}
- Target Exam: ${targetExam}
- Duration: ${startDate} to ${endDate}
- Weak Subjects: ${weakSubjects.join(', ')}

Generate a study plan with:
1. Weekly breakdown of topics to cover
2. Daily study tasks (2-3 hours per day)
3. Practice session recommendations
4. Mock test schedule
5. Revision sessions

Return the response as a JSON object with this structure:
{
  "title": "Study Plan Title",
  "description": "Brief overview",
  "items": [
    {
      "date": "YYYY-MM-DD",
      "subject": "Subject Name",
      "title": "Task Title",
      "description": "Detailed description",
      "duration": 90
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
            name: 'create_study_plan',
            description: 'Create a structured study plan',
            parameters: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      date: { type: 'string' },
                      subject: { type: 'string' },
                      title: { type: 'string' },
                      description: { type: 'string' },
                      duration: { type: 'number' }
                    },
                    required: ['date', 'subject', 'title', 'description', 'duration']
                  }
                }
              },
              required: ['title', 'description', 'items']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'create_study_plan' } }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI API Error:', error);
      throw new Error('Failed to generate study plan');
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No study plan generated');
    }

    const studyPlan = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(studyPlan), {
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