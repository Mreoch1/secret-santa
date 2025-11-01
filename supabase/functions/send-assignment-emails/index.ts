// Supabase Edge Function to send Secret Santa assignment emails
// This uses Deno's built-in email capabilities

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''

serve(async (req) => {
  try {
    const { assignments, participants } = await req.json()

    // Create a map of participant IDs to participant objects
    const participantMap = new Map()
    participants.forEach(p => participantMap.set(p.id, p))

    // Send email to each participant
    const emailPromises = assignments.map(async (assignment) => {
      const giver = participantMap.get(assignment.giver_id)
      const receiver = participantMap.get(assignment.receiver_id)

      if (!giver || !receiver) {
        console.error('Missing participant data')
        return
      }

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
            .gift-box {
              text-align: center;
              font-size: 4em;
              margin: 20px 0;
            }
            .assignment {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 10px;
              text-align: center;
              margin: 30px 0;
              border: 3px solid #ffd700;
            }
            .receiver-name {
              font-size: 2em;
              color: #c41e3a;
              font-weight: bold;
              margin: 15px 0;
            }
            .message {
              font-size: 1.2em;
              color: #0f7c3a;
              font-weight: bold;
              margin-top: 20px;
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
            <h1>🎄 Secret Santa Assignment 🎅</h1>
            <p>Ho ho ho, ${giver.name}!</p>
            <p>Your Secret Santa assignment is ready!</p>
            
            <div class="gift-box">🎁</div>
            
            <div class="assignment">
              <p>You're buying a gift for:</p>
              <p class="receiver-name">${receiver.name}</p>
              <p class="message">Happy Shopping! 🎅</p>
            </div>
            
            <p>Remember to keep it a secret! 🤫</p>
            
            <div class="footer">
              <p>🎄 Secret Santa 2025 🎄</p>
              <p>Spreading holiday cheer, one gift at a time!</p>
            </div>
          </div>
        </body>
        </html>
      `

      // Send email using Resend (free tier allows 100 emails/day without credit card)
      // Alternative: You can use any email service or Supabase's built-in SMTP
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Secret Santa <onboarding@resend.dev>', // Update with your domain
          to: [giver.email],
          subject: '🎅 Your Secret Santa Assignment!',
          html: emailHtml
        })
      })

      if (!res.ok) {
        console.error('Email send failed:', await res.text())
      }

      return res
    })

    await Promise.all(emailPromises)

    return new Response(
      JSON.stringify({ success: true, message: 'Emails sent successfully' }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error sending emails:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

