
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId, conversationHistory = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Processing query with', conversationHistory.length, 'previous messages');

    // Build conversation messages
    const messages = [
      {
        role: 'system',
        content: `You are a thoughtful decision-making assistant. Your job is to help users make decisions by:
1. If you don't have enough context, ask 1-2 specific clarifying questions to understand their situation better
2. Once you have sufficient context, provide a clear recommendation with reasoning
3. Keep responses conversational and natural

When you need more info, set needsMoreInfo to true and ask questions.
When ready to decide, set needsMoreInfo to false and provide decision, reasoning, and alternatives.`
      }
    ];

    // Add conversation history
    conversationHistory.forEach((msg: any) => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add current query
    messages.push({
      role: 'user',
      content: query
    });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        tools: [
          {
            type: "function",
            function: {
              name: "respond_to_user",
              description: "Respond to the user's decision request",
              parameters: {
                type: "object",
                properties: {
                  response: { 
                    type: "string", 
                    description: "Your response - either questions for clarification or your final decision with reasoning" 
                  },
                  needsMoreInfo: { 
                    type: "boolean", 
                    description: "True if you need to ask questions, false if ready to make a decision" 
                  }
                },
                required: ["response", "needsMoreInfo"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "respond_to_user" } }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI gateway error:', error);
      throw new Error('Failed to process search');
    }

    const data = await response.json();
    
    // Extract structured data from tool call
    const toolCall = data.choices[0].message.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in response');
    }
    
    const result = JSON.parse(toolCall.function.arguments);
    console.log('Response generated, needsMoreInfo:', result.needsMoreInfo);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in universal-search:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
