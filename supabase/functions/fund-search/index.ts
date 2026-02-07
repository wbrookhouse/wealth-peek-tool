import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: "Query must be at least 2 characters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    
    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Search service not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Search for fund information using Firecrawl
    const searchQuery = `"${query}" fund code Canada mutual fund OR seg fund`;
    
    const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 10,
        scrapeOptions: {
          formats: ["markdown"],
        },
      }),
    });

    if (!searchResponse.ok) {
      console.error("Firecrawl search failed:", await searchResponse.text());
      return new Response(
        JSON.stringify({ success: false, error: "Search failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const searchData = await searchResponse.json();
    const results: { fundCode: string; fundName: string; source: string }[] = [];
    
    // Parse results to extract fund codes
    if (searchData.data && Array.isArray(searchData.data)) {
      for (const result of searchData.data) {
        const content = result.markdown || result.content || "";
        const title = result.title || "";
        const url = result.url || "";
        
        // Look for fund codes in various formats
        // Common patterns: ABC1234, RBF1018, CIG2111, etc.
        const fundCodePatterns = [
          /\b([A-Z]{2,4}\d{3,5})\b/g,  // Standard format like RBF1018
          /Fund Code[:\s]+([A-Z0-9]+)/gi,
          /Code[:\s]+([A-Z]{2,4}\d{3,5})/gi,
        ];
        
        const foundCodes = new Set<string>();
        
        for (const pattern of fundCodePatterns) {
          const matches = content.matchAll(pattern);
          for (const match of matches) {
            const code = match[1].toUpperCase();
            if (code.length >= 5 && code.length <= 10) {
              foundCodes.add(code);
            }
          }
        }
        
        // Try to extract fund name from title or content
        let fundName = title;
        if (!fundName && content) {
          // Try to extract first meaningful line as fund name
          const lines = content.split('\n').filter((l: string) => l.trim().length > 10);
          if (lines.length > 0) {
            fundName = lines[0].substring(0, 100);
          }
        }
        
        // Add found codes to results
        for (const code of foundCodes) {
          if (!results.some(r => r.fundCode === code)) {
            results.push({
              fundCode: code,
              fundName: fundName || `Fund ${code}`,
              source: url
            });
          }
        }
      }
    }

    // Limit results
    const limitedResults = results.slice(0, 10);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results: limitedResults,
        query: query
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Fund search error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Search failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
