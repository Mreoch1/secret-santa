// Edge Function to send email notification when a support ticket is created
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = 'mreoch82@hotmail.com'
const SITE_URL = Deno.env.get('SITE_URL') || 'https://holidaydrawnames.com'

serve(async (req) => {
  try {
    // Get the new ticket from the request
    const { record } = await req.json()
    
    if (!record) {
      return new Response(
        JSON.stringify({ error: 'No record provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Extract ticket information
    const { id, name, email, group_code, message, created_at } = record

    // Create email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background: #f5f5f5;
            padding: 20px;
            margin: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 {
            color: #c41e3a;
            font-size: 1.8em;
            margin-bottom: 20px;
          }
          .ticket-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #c41e3a;
          }
          .info-row {
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .label {
            color: #666;
            font-size: 0.9em;
            font-weight: bold;
            display: inline-block;
            width: 120px;
          }
          .value {
            color: #333;
            font-size: 1em;
          }
          .message-box {
            background: #fff3cd;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
          }
          .button {
            display: inline-block;
            background: #c41e3a;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            margin-top: 30px;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎄 New Support Ticket</h1>
          
          <p>A new support ticket has been submitted on Holiday Draw Names.</p>
          
          <div class="ticket-info">
            <div class="info-row">
              <span class="label">Ticket ID:</span>
              <span class="value">${id}</span>
            </div>
            <div class="info-row">
              <span class="label">Name:</span>
              <span class="value">${name}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value"><a href="mailto:${email}">${email}</a></span>
            </div>
            ${group_code ? `
            <div class="info-row">
              <span class="label">Group Code:</span>
              <span class="value">${group_code}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="label">Submitted:</span>
              <span class="value">${new Date(created_at).toLocaleString()}</span>
            </div>
          </div>
          
          <div class="message-box">
            <strong>Message:</strong>
            <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${SITE_URL}/support.html" class="button">View Support Page</a>
          </div>
          
          <div class="footer">
            <p>🎄 Holiday Draw Names Support System</p>
            <p>Reply to this email or contact the user directly at: <a href="mailto:${email}">${email}</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email via Resend if API key is available
    if (RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Holiday Draw Names Support <santa@holidaydrawnames.com>',
          to: [ADMIN_EMAIL],
          subject: `🎄 New Support Ticket: ${name}`,
          html: emailHtml
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Resend API error:', result)
        // Don't fail the request - ticket is still created
      }
    } else {
      console.warn('RESEND_API_KEY not configured - email notification skipped')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in notify-support-ticket function:', error)
    // Don't fail - ticket creation should still succeed
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
})

