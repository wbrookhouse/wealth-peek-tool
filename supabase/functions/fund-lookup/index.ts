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

// Simple in-memory rate limiter
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 100;

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }
  
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }
  
  return 'unknown';
}

function isRateLimited(clientIP: string): { limited: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(clientIP);
  
  if (Math.random() < 0.01) {
    for (const [ip, e] of rateLimitStore.entries()) {
      if (now > e.resetTime) {
        rateLimitStore.delete(ip);
      }
    }
  }
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS
    });
    return { limited: false, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { limited: true, remaining: 0, resetIn: entry.resetTime - now };
  }
  
  entry.count++;
  return { limited: false, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, resetIn: entry.resetTime - now };
}

// Exchange suffixes to try for direct lookup
// Exchange suffixes to try - .CF for Canadian mutual funds, .TO for Toronto stocks/ETFs
const EXCHANGE_SUFFIXES = ['', '.US', '.TO', '.CF', '.CA', '.V', '.CN', '.NEO'];

interface SearchResult {
  Code: string;
  Exchange: string;
  Name: string;
  Type: string;
  Country?: string;
  Currency?: string;
  ISIN?: string;
}

interface EODHDFundamentals {
  General?: {
    Code?: string;
    Name?: string;
    Type?: string;
  };
  ETF_Data?: {
    NetExpenseRatio?: number;
    Ongoing_Charge?: number;
    Max_Annual_Mgmt_Charge?: number;
  };
  MutualFund?: {
    Fund_NetExpenseRatio?: number;
    Fund_MaxRedemptionFee?: number;
    Net_Expense_Ratio?: number;
    Expense_Ratio?: number;
  };
}

// Use EODHD Search API to find the correct ticker
async function searchForTicker(fundCode: string, apiKey: string): Promise<string[]> {
  const url = `https://eodhd.com/api/search/${encodeURIComponent(fundCode)}?api_token=${apiKey}&fmt=json&limit=10`;
  
  console.log(`[fund-lookup] Searching for ticker: ${fundCode}`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`[fund-lookup] Search returned ${response.status}`);
      return [];
    }
    
    const results: SearchResult[] = await response.json();
    
    if (!Array.isArray(results) || results.length === 0) {
      console.log(`[fund-lookup] No search results found`);
      return [];
    }
    
    // Filter for funds, ETFs, and stocks that match - prioritize Canadian exchanges
    const tickers: string[] = [];
    
    // First add exact code matches
    for (const result of results) {
      if (result.Code && result.Exchange) {
        const fullTicker = `${result.Code}.${result.Exchange}`;
        // Check if the code contains the search term
        if (result.Code.includes(fundCode) || (result.Name && result.Name.toLowerCase().includes(fundCode.toLowerCase()))) {
          tickers.push(fullTicker);
          console.log(`[fund-lookup] Found potential match: ${fullTicker} - ${result.Name} (${result.Type})`);
        }
      }
    }
    
    // If no exact matches, add all results
    if (tickers.length === 0) {
      for (const result of results) {
        if (result.Code && result.Exchange) {
          const fullTicker = `${result.Code}.${result.Exchange}`;
          tickers.push(fullTicker);
          console.log(`[fund-lookup] Adding search result: ${fullTicker} - ${result.Name}`);
        }
      }
    }
    
    // Prioritize Canadian tickers (.TO, .V)
    tickers.sort((a, b) => {
      const aIsCan = a.endsWith('.TO') || a.endsWith('.V') || a.endsWith('.CA');
      const bIsCan = b.endsWith('.TO') || b.endsWith('.V') || b.endsWith('.CA');
      if (aIsCan && !bIsCan) return -1;
      if (!aIsCan && bIsCan) return 1;
      return 0;
    });
    
    return tickers.slice(0, 5); // Return top 5 matches
  } catch (error) {
    console.error(`[fund-lookup] Search error:`, error);
    return [];
  }
}

// Get MER from fundamentals data
function extractMER(data: EODHDFundamentals): { mer: number; source: string } | null {
  // For ETFs
  if (data.ETF_Data) {
    if (data.ETF_Data.NetExpenseRatio !== undefined && data.ETF_Data.NetExpenseRatio !== null && data.ETF_Data.NetExpenseRatio > 0) {
      // NetExpenseRatio is in decimal form (e.g., 0.0015 for 0.15%)
      const mer = data.ETF_Data.NetExpenseRatio * 100;
      return { mer: Math.round(mer * 100) / 100, source: 'EODHD ETF Data' };
    }
    if (data.ETF_Data.Ongoing_Charge !== undefined && data.ETF_Data.Ongoing_Charge !== null && data.ETF_Data.Ongoing_Charge > 0) {
      const mer = data.ETF_Data.Ongoing_Charge * 100;
      return { mer: Math.round(mer * 100) / 100, source: 'EODHD ETF Ongoing Charge' };
    }
    if (data.ETF_Data.Max_Annual_Mgmt_Charge !== undefined && data.ETF_Data.Max_Annual_Mgmt_Charge !== null && data.ETF_Data.Max_Annual_Mgmt_Charge > 0) {
      const mer = data.ETF_Data.Max_Annual_Mgmt_Charge * 100;
      return { mer: Math.round(mer * 100) / 100, source: 'EODHD ETF Mgmt Charge' };
    }
  }
  
  // For Mutual Funds
  if (data.MutualFund) {
    if (data.MutualFund.Fund_NetExpenseRatio !== undefined && data.MutualFund.Fund_NetExpenseRatio !== null && data.MutualFund.Fund_NetExpenseRatio > 0) {
      const mer = data.MutualFund.Fund_NetExpenseRatio * 100;
      return { mer: Math.round(mer * 100) / 100, source: 'EODHD Mutual Fund Data' };
    }
    if (data.MutualFund.Net_Expense_Ratio !== undefined && data.MutualFund.Net_Expense_Ratio !== null && data.MutualFund.Net_Expense_Ratio > 0) {
      const mer = data.MutualFund.Net_Expense_Ratio * 100;
      return { mer: Math.round(mer * 100) / 100, source: 'EODHD Mutual Fund Data' };
    }
    if (data.MutualFund.Expense_Ratio !== undefined && data.MutualFund.Expense_Ratio !== null && data.MutualFund.Expense_Ratio > 0) {
      const mer = data.MutualFund.Expense_Ratio * 100;
      return { mer: Math.round(mer * 100) / 100, source: 'EODHD Mutual Fund Data' };
    }
  }
  
  return null;
}

// Lookup fundamentals for a specific ticker
async function lookupFundamentals(ticker: string, apiKey: string): Promise<{ name: string; mer: number; source: string } | null> {
  const url = `https://eodhd.com/api/fundamentals/${ticker}?api_token=${apiKey}&fmt=json`;
  
  console.log(`[fund-lookup] Fetching fundamentals for: ${ticker}`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`[fund-lookup] Fundamentals returned ${response.status} for ${ticker}`);
      return null;
    }
    
    const data: EODHDFundamentals = await response.json();
    
    if (!data || typeof data !== 'object') {
      console.log(`[fund-lookup] Invalid response for ${ticker}`);
      return null;
    }
    
    const fundName = data.General?.Name || ticker;
    const merData = extractMER(data);
    
    if (merData) {
      console.log(`[fund-lookup] Found MER for ${ticker}: ${merData.mer}%`);
      return {
        name: fundName,
        mer: merData.mer,
        source: merData.source
      };
    }
    
    console.log(`[fund-lookup] No MER data in fundamentals for ${ticker} (found fund: ${fundName})`);
    return null;
  } catch (error) {
    console.error(`[fund-lookup] Error fetching fundamentals for ${ticker}:`, error);
    return null;
  }
}

async function lookupWithEODHD(fundCode: string, apiKey: string): Promise<FundLookupResponse | null> {
  // Step 1: Try direct lookup with exchange suffixes
  for (const suffix of EXCHANGE_SUFFIXES) {
    const ticker = `${fundCode}${suffix}`;
    const result = await lookupFundamentals(ticker, apiKey);
    
    if (result) {
      return {
        success: true,
        fundCode: fundCode,
        fundName: result.name,
        mer: result.mer,
        source: result.source
      };
    }
  }
  
  // Step 2: Use search API to find the ticker
  const searchResults = await searchForTicker(fundCode, apiKey);
  
  for (const ticker of searchResults) {
    const result = await lookupFundamentals(ticker, apiKey);
    
    if (result) {
      return {
        success: true,
        fundCode: fundCode,
        fundName: result.name,
        mer: result.mer,
        source: result.source
      };
    }
  }
  
  return null;
}

// Fallback: Search for Canadian mutual fund MER data using Firecrawl
async function lookupWithFirecrawl(fundCode: string): Promise<FundLookupResponse | null> {
  const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!firecrawlApiKey) {
    console.log('[fund-lookup] FIRECRAWL_API_KEY not configured, skipping Firecrawl fallback');
    return null;
  }

  console.log(`[fund-lookup] Searching for fund with Firecrawl: ${fundCode}`);
  
  // MER extraction patterns - common ways MER is displayed
  const merPatterns = [
    /MER[:\s]+(\d+\.?\d*)%/i,
    /Management\s+Expense\s+Ratio[:\s]+(\d+\.?\d*)%/i,
    /Expense\s+Ratio[:\s]+(\d+\.?\d*)%/i,
    /Net\s+Expense[:\s]+(\d+\.?\d*)%/i,
    /Management\s+fee[:\s]+(\d+\.?\d*)%/i,
    /Total\s+Expense[:\s]+(\d+\.?\d*)%/i,
    /\|\s*MER\s*\|\s*(\d+\.?\d*)%/i  // Table format
  ];

  // Helper function to extract MER from markdown content
  function extractMER(markdown: string): number | null {
    for (const pattern of merPatterns) {
      const match = markdown.match(pattern);
      if (match && match[1]) {
        const mer = parseFloat(match[1]);
        // Validate MER is in reasonable range (0.01% to 10%)
        if (mer >= 0.01 && mer <= 10) {
          return Math.round(mer * 100) / 100;
        }
      }
    }
    return null;
  }

  try {
    // Strategy 1: Search for fund fact sheet with MER
    const searchQueries = [
      `"${fundCode}" MER fund fact sheet Canada`,
      `"${fundCode}" management expense ratio mutual fund`,
      `site:morningstar.ca "${fundCode}"`,
      `site:globeandmail.com "${fundCode}" fund`
    ];

    for (const query of searchQueries) {
      console.log(`[fund-lookup] Firecrawl search: ${query}`);
      
      const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          limit: 5,
          lang: 'en',
          scrapeOptions: {
            formats: ['markdown']
          }
        }),
      });

      if (!searchResponse.ok) {
        console.log(`[fund-lookup] Firecrawl search failed: ${searchResponse.status}`);
        continue;
      }

      const searchData = await searchResponse.json();
      
      if (!searchData.success || !searchData.data || searchData.data.length === 0) {
        console.log(`[fund-lookup] No results for query: ${query}`);
        continue;
      }

      // Parse search results for MER data
      for (const result of searchData.data) {
        const markdown = result.markdown || '';
        const title = result.title || '';
        const url = result.url || '';
        
        console.log(`[fund-lookup] Checking result: ${title} (${url})`);
        
        const mer = extractMER(markdown);
        
        if (mer !== null) {
          console.log(`[fund-lookup] Found MER ${mer}% from ${url}`);
          
          // Extract fund name from title
          let fundName = title
            .replace(/\s*-\s*(Morningstar|Globe|Fund Facts).*$/i, '')
            .replace(/\s*\(.*\)$/, '')
            .trim();
          
          if (!fundName || fundName.length < 3) {
            fundName = `Fund ${fundCode}`;
          }
          
          // Determine source from URL
          let source = 'Fund Data Search';
          if (url.includes('morningstar')) {
            source = 'Morningstar Canada';
          } else if (url.includes('globeandmail')) {
            source = 'Globe and Mail';
          } else if (url.includes('cifinancial') || url.includes('ci.com')) {
            source = 'CI Financial';
          }
          
          return {
            success: true,
            fundCode: fundCode,
            fundName: fundName,
            mer: mer,
            source: source
          };
        }
      }
    }

    console.log(`[fund-lookup] Could not find MER via Firecrawl for ${fundCode}`);
    return null;
  } catch (error) {
    console.error(`[fund-lookup] Firecrawl lookup error:`, error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);
  const rateLimit = isRateLimited(clientIP);
  
  if (rateLimit.limited) {
    console.log(`[fund-lookup] Rate limit exceeded for IP: ${clientIP.substring(0, 8)}...`);
    return new Response(
      JSON.stringify({ 
        success: false, 
        fundCode: '', 
        error: 'Too many requests. Please try again later.' 
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(rateLimit.resetIn / 1000).toString()
        } 
      }
    );
  }

  try {
    const { fundCode } = await req.json() as FundLookupRequest;

    if (!fundCode || fundCode.trim() === '') {
      return new Response(
        JSON.stringify({ success: false, fundCode: '', error: 'Fund code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanedCode = fundCode.trim().toUpperCase();

    if (cleanedCode.length < 2 || cleanedCode.length > 20) {
      return new Response(
        JSON.stringify({ success: false, fundCode: cleanedCode, error: 'Invalid fund code length' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!/^[A-Z0-9.-]+$/.test(cleanedCode)) {
      return new Response(
        JSON.stringify({ success: false, fundCode: cleanedCode, error: 'Fund code must contain only letters, numbers, dots, and hyphens' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[fund-lookup] Looking up fund: ${cleanedCode}`);

    const eodhdApiKey = Deno.env.get('EODHD_API_KEY');
    if (!eodhdApiKey) {
      console.error('[fund-lookup] EODHD_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, fundCode: cleanedCode, error: 'Unable to process request. Please try again later.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Try EODHD API
    const eodhResult = await lookupWithEODHD(cleanedCode, eodhdApiKey);
    
    if (eodhResult) {
      console.log(`[fund-lookup] EODHD Success: ${cleanedCode} -> ${eodhResult.fundName} (MER: ${eodhResult.mer}%)`);
      return new Response(
        JSON.stringify(eodhResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Fallback to Firecrawl search for Canadian mutual funds
    console.log(`[fund-lookup] EODHD failed, trying Firecrawl fallback for: ${cleanedCode}`);
    const firecrawlResult = await lookupWithFirecrawl(cleanedCode);
    
    if (firecrawlResult) {
      console.log(`[fund-lookup] Firecrawl Success: ${cleanedCode} -> ${firecrawlResult.fundName} (MER: ${firecrawlResult.mer}%)`);
      return new Response(
        JSON.stringify(firecrawlResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[fund-lookup] Could not find MER for fund: ${cleanedCode}`);
    return new Response(
      JSON.stringify({ 
        success: false, 
        fundCode: cleanedCode, 
        error: 'Could not find MER for this fund code. Please verify the code is correct or enter the MER manually.' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[fund-lookup] Unexpected error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ success: false, fundCode: '', error: 'An unexpected error occurred. Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
