const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FundLookupRequest {
  fundCode: string;
}

interface FundLookupResponse {
  success: boolean;
  fundCode: string;
  fundName?: string;
  mer?: number;
  error?: string;
  source?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fundCode } = await req.json() as FundLookupRequest;

    // Input validation - check for empty input
    if (!fundCode || fundCode.trim() === '') {
      console.log('[fund-lookup] Validation failed: empty fund code');
      return new Response(
        JSON.stringify({ success: false, fundCode: '', error: 'Fund code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanedCode = fundCode.trim().toUpperCase();

    // Validate fund code length (typically 3-20 characters)
    if (cleanedCode.length < 3 || cleanedCode.length > 20) {
      console.log('[fund-lookup] Validation failed: invalid length');
      return new Response(
        JSON.stringify({ success: false, fundCode: cleanedCode, error: 'Invalid fund code length' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate fund code format (alphanumeric only)
    if (!/^[A-Z0-9]+$/.test(cleanedCode)) {
      console.log('[fund-lookup] Validation failed: invalid characters');
      return new Response(
        JSON.stringify({ success: false, fundCode: cleanedCode, error: 'Fund code must contain only letters and numbers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[fund-lookup] Looking up fund: ${cleanedCode}`);

    // Step 1: Use Firecrawl to search for the fund fact sheet
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.error('[fund-lookup] FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, fundCode: cleanedCode, error: 'Unable to process request. Please try again later.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search for Canadian fund fact sheet
    const searchQuery = `"${cleanedCode}" fund facts MER management expense ratio Canada`;
    console.log(`[fund-lookup] Searching for fund: ${cleanedCode}`);

    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 5,
        scrapeOptions: {
          formats: ['markdown']
        }
      }),
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok || !searchData.success) {
      console.error('[fund-lookup] Search failed for fund:', cleanedCode, 'status:', searchResponse.status);
      return new Response(
        JSON.stringify({ 
          success: false, 
          fundCode: cleanedCode, 
          error: 'Could not find fund information. Please verify the fund code.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Combine all markdown content from search results
    const combinedContent = searchData.data
      ?.map((result: any) => `Source: ${result.url}\n${result.markdown || result.description || ''}`)
      .join('\n\n---\n\n') || '';

    if (!combinedContent || combinedContent.length < 50) {
      console.log('[fund-lookup] No substantial content found for fund:', cleanedCode);
      return new Response(
        JSON.stringify({ 
          success: false, 
          fundCode: cleanedCode, 
          error: 'Could not find fund fact sheet. Please verify the fund code is correct.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[fund-lookup] Found content for ${cleanedCode}, processing...`);

    // Step 2: Use AI to extract the MER from the content
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('[fund-lookup] LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, fundCode: cleanedCode, error: 'Unable to process request. Please try again later.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a financial data extraction expert. Your task is to extract the Management Expense Ratio (MER) from Canadian fund fact sheets and fund documents. 

The MER is typically expressed as a percentage (e.g., 2.35%, 1.50%, 0.25%). It may also be called:
- Management Expense Ratio
- MER
- Total annual fund operating expenses
- Expense ratio

IMPORTANT: Return ONLY a valid JSON object with these exact fields:
- fundName: The official name of the fund (string)
- mer: The MER as a decimal number (e.g., 2.35 for 2.35%, NOT 0.0235)
- source: Where you found this information (string)
- confidence: "high", "medium", or "low"

If you cannot find a clear MER, return:
{ "fundName": null, "mer": null, "source": null, "confidence": "low", "error": "Could not find MER" }

Return ONLY the JSON object, no other text.`
          },
          {
            role: 'user',
            content: `Extract the MER for fund code "${cleanedCode}" from the following fund documents:\n\n${combinedContent.substring(0, 15000)}`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_fund_mer',
              description: 'Extract the MER and fund details from fund documents',
              parameters: {
                type: 'object',
                properties: {
                  fundName: { type: 'string', description: 'The official fund name' },
                  mer: { type: 'number', description: 'The MER as a percentage number (e.g., 2.35 for 2.35%)' },
                  source: { type: 'string', description: 'Where the information was found' },
                  confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
                  error: { type: 'string', description: 'Error message if MER could not be found' }
                },
                required: ['confidence']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_fund_mer' } }
      }),
    });

    const aiData = await aiResponse.json();

    if (!aiResponse.ok) {
      console.error('[fund-lookup] AI processing failed for fund:', cleanedCode, 'status:', aiResponse.status);
      return new Response(
        JSON.stringify({ 
          success: false, 
          fundCode: cleanedCode, 
          error: 'Unable to analyze fund data. Please try again later.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract the tool call result
    let extractedData: any = null;
    
    if (aiData.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      try {
        extractedData = JSON.parse(aiData.choices[0].message.tool_calls[0].function.arguments);
      } catch (e) {
        console.error('[fund-lookup] Failed to parse AI response for fund:', cleanedCode);
      }
    }

    // Fallback: try to parse from content if tool call didn't work
    if (!extractedData && aiData.choices?.[0]?.message?.content) {
      try {
        const content = aiData.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('[fund-lookup] Failed to parse AI content for fund:', cleanedCode);
      }
    }

    if (!extractedData || extractedData.error || extractedData.mer === null) {
      console.log('[fund-lookup] Could not extract MER for fund:', cleanedCode);
      return new Response(
        JSON.stringify({ 
          success: false, 
          fundCode: cleanedCode, 
          error: 'Could not determine MER from available documents. Please verify the fund code.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[fund-lookup] Successfully extracted MER for ${cleanedCode}`);

    const response: FundLookupResponse = {
      success: true,
      fundCode: cleanedCode,
      fundName: extractedData.fundName || cleanedCode,
      mer: extractedData.mer,
      source: extractedData.source || 'Fund Fact Sheet'
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[fund-lookup] Unexpected error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ success: false, fundCode: '', error: 'An unexpected error occurred. Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
