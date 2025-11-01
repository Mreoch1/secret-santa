// Edge Function to send Secret Santa group invitation emails
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { groupCode, groupPassword, emails, personalMessage, senderName } = await req.json()

    if (!groupCode || !groupPassword || !emails || emails.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:8000'
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    // Send email to each recipient
    const emailPromises = emails.map(async (email: string) => {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background: linear-gradient(135deg, #0f7c3a 0%, #c41e3a 100%);
              padding: 20px;
              margin: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }
            h1 {
              color: #c41e3a;
              font-size: 2.5em;
              text-align: center;
              margin-bottom: 20px;
            }
            .invitation-box {
              background: #f0fdf4;
              padding: 25px;
              border-radius: 10px;
              margin: 30px 0;
              border: 3px solid #0f7c3a;
            }
            .credential {
              background: white;
              padding: 15px;
              border-radius: 8px;
              margin: 10px 0;
              font-family: monospace;
              font-size: 1.1em;
            }
            .label {
              color: #666;
              font-size: 0.9em;
              margin-bottom: 5px;
            }
            .value {
              color: #c41e3a;
              font-weight: bold;
              font-size: 1.2em;
            }
            .button {
              display: inline-block;
              background: #c41e3a;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 10px;
              font-weight: bold;
              margin: 20px auto;
              text-align: center;
            }
            .message-box {
              background: #fef3c7;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
              border-left: 4px solid #ffd700;
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
            <h1>🎄 You're Invited! 🎅</h1>
            
            <p>Hi there!</p>
            
            ${personalMessage ? `
              <div class="message-box">
                <p style="margin: 0;"><strong>${senderName || 'Your friend'}</strong> says:</p>
                <p style="margin: 10px 0 0 0; font-style: italic;">"${personalMessage}"</p>
              </div>
            ` : ''}
            
            <p>You've been invited to join a Secret Santa group!</p>
            
            <div class="invitation-box">
              <h3 style="color: #0f7c3a; margin-top: 0;">Join Information</h3>
              
              <div class="credential">
                <div class="label">Group Code:</div>
                <div class="value">${groupCode}</div>
              </div>
              
              <div class="credential">
                <div class="label">Password:</div>
                <div class="value">${groupPassword}</div>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${siteUrl}" class="button">
                Join Secret Santa 🎁
              </a>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
              <h4 style="margin-top: 0;">How to Join:</h4>
              <ol style="line-height: 1.8;">
                <li>Click the button above or visit: <a href="${siteUrl}">${siteUrl}</a></li>
                <li>Create an account or sign in</li>
                <li>Click "Join a Group"</li>
                <li>Enter the group code and password above</li>
                <li>Wait for the organizer to draw names</li>
                <li>See who you got and start shopping! 🎅</li>
              </ol>
            </div>
            
            <div class="footer">
              <p>🎄 Secret Santa 2025 🎄</p>
              <p>Spreading holiday cheer, one gift at a time!</p>
            </div>
          </div>
        </body>
        </html>
      `

      // Try to send via Resend if configured
      if (resendApiKey) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'Secret Santa <santa@yourdomain.com>',
            to: [email],
            subject: `🎅 You're Invited to Join Secret Santa - ${groupCode}`,
            html: emailHtml
          })
        })

        if (!res.ok) {
          console.error('Resend API error:', await res.text())
          throw new Error('Failed to send email via Resend')
        }

        return { email, status: 'sent' }
      } else {
        // Log to console if no email service configured
        console.log(`Would send invitation to ${email}`)
        return { email, status: 'logged' }
      }
    })

    const results = await Promise.all(emailPromises)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invitations sent to ${emails.length} recipients`,
        results 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error sending invites:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

