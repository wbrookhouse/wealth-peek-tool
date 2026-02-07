import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Investment {
  fundCode: string;
  fundName: string;
  amount: number;
  mer: number;
  annualFee: number;
  accountType: string;
}

interface Service {
  id: string;
  name: string;
  checked: boolean;
}

interface ReportEmailRequest {
  email: string;
  firstName?: string;
  investments: Investment[];
  services: Service[];
  meetingsPerYear: number;
  meetingLabel: string;
  totalInvested: number;
  totalFees: number;
  weightedMER: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      firstName,
      investments,
      services,
      meetingsPerYear,
      meetingLabel,
      totalInvested,
      totalFees,
      weightedMER,
    }: ReportEmailRequest = await req.json();

    console.log(`[send-report-email] Sending report to: ${email}`);

    // Validate required fields
    if (!email || !email.includes('@')) {
      throw new Error("Valid email address is required");
    }

    const checkedServices = services.filter(s => s.checked);
    const uncheckedServices = services.filter(s => !s.checked);
    const greeting = firstName ? `Hi ${firstName},` : 'Hello,';

    // Build investment rows
    const investmentRows = investments
      .filter(inv => inv.mer !== null)
      .map(inv => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
            <strong style="color: #22c55e;">${inv.fundCode}</strong><br>
            <span style="color: #6b7280; font-size: 12px;">${inv.fundName}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">${formatCurrency(inv.amount)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">${formatPercent(inv.mer)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right; font-weight: 600;">${formatCurrency(inv.annualFee)}</td>
        </tr>
      `).join('');

    // Build services lists
    const servicesReceived = checkedServices.length > 0
      ? checkedServices.map(s => `<li style="margin: 4px 0;">✓ ${s.name}</li>`).join('')
      : '<li style="color: #6b7280; font-style: italic;">No services selected</li>';

    const servicesNotReceived = uncheckedServices.length > 0
      ? uncheckedServices.map(s => `<li style="margin: 4px 0; color: #6b7280;">✗ ${s.name}</li>`).join('')
      : '<li style="color: #22c55e;">You\'re receiving all services!</li>';

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Your Fee Report</h1>
      <p style="color: #94a3b8; margin: 8px 0 0 0;">WealthPeek Investment Analysis</p>
    </div>

    <div style="padding: 32px;">
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">${greeting}</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Thank you for using WealthPeek. Here's a summary of your investment fees and services.
      </p>

      <!-- Total Fees Highlight -->
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
        <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 14px;">Your Total Annual Fees</p>
        <p style="color: #22c55e; font-size: 42px; font-weight: bold; margin: 0;">${formatCurrency(totalFees)}</p>
        <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">per year</p>
        <div style="margin-top: 16px; color: #94a3b8; font-size: 14px;">
          Total Invested: <strong style="color: white;">${formatCurrency(totalInvested)}</strong> &nbsp;|&nbsp; 
          Average MER: <strong style="color: white;">${formatPercent(weightedMER)}</strong>
        </div>
      </div>

      <!-- Investment Table -->
      <h2 style="color: #111827; font-size: 18px; margin: 32px 0 16px 0;">Your Investments</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 500;">Fund</th>
            <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 500;">Amount</th>
            <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 500;">MER</th>
            <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 500;">Annual Fee</th>
          </tr>
        </thead>
        <tbody>
          ${investmentRows}
          <tr style="font-weight: 600; background: #f9fafb;">
            <td style="padding: 12px;">Total</td>
            <td style="padding: 12px; text-align: right;">${formatCurrency(totalInvested)}</td>
            <td style="padding: 12px; text-align: right;">${formatPercent(weightedMER)}</td>
            <td style="padding: 12px; text-align: right; color: #22c55e;">${formatCurrency(totalFees)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Services -->
      <div style="display: flex; gap: 24px; margin-top: 32px;">
        <div style="flex: 1;">
          <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0;">✓ Services You Receive</h3>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; color: #374151;">
            ${servicesReceived}
          </ul>
          <p style="margin-top: 12px; font-size: 13px; color: #6b7280;">
            📅 Advisor meetings: <strong>${meetingLabel}</strong>
          </p>
        </div>
        <div style="flex: 1;">
          <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0;">✗ Services Not Received</h3>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px;">
            ${servicesNotReceived}
          </ul>
        </div>
      </div>

      <!-- Summary -->
      <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin-top: 32px; text-align: center;">
        <h3 style="color: #166534; margin: 0 0 12px 0;">Summary</h3>
        <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.8;">
          You are paying <strong style="color: #22c55e;">${formatCurrency(totalFees)}</strong> per year in fees<br>
          You are receiving <strong>${checkedServices.length}</strong> of ${services.length} possible services<br>
          You meet with your advisor <strong>${meetingLabel.toLowerCase()}</strong>
        </p>
      </div>

      ${totalFees > 3500 ? `
      <!-- CTA -->
      <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 8px; padding: 24px; margin-top: 24px; text-align: center;">
        <p style="color: white; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">There may be a better way.</p>
        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">Would you like to learn more? Reply to this email to schedule a consultation.</p>
      </div>
      ` : ''}

    </div>

    <!-- Footer -->
    <div style="background: #f3f4f6; padding: 20px; text-align: center;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        This report was generated by WealthPeek. The information provided is for educational purposes only.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: "WealthPeek <onboarding@resend.dev>",  // Use Resend's test domain
      to: [email],
      subject: `Your WealthPeek Fee Report - ${formatCurrency(totalFees)}/year`,
      html: emailHtml,
    });

    console.log("[send-report-email] Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[send-report-email] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
