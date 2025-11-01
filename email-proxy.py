#!/usr/bin/env python3
"""
Simple email proxy server for Secret Santa
Forwards email requests to Resend API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for local development

RESEND_API_KEY = 're_cfiPFoPP_DNJvMhYgMM28Edh6bxoMchdj'
RESEND_API_URL = 'https://api.resend.com/emails'

@app.route('/send-email', methods=['POST'])
def send_email():
    """Proxy endpoint to send emails via Resend"""
    try:
        data = request.json
        
        # Forward request to Resend API
        headers = {
            'Authorization': f'Bearer {RESEND_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            RESEND_API_URL,
            headers=headers,
            json=data
        )
        
        if response.status_code == 200:
            return jsonify({
                'success': True,
                'data': response.json()
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': response.text
            }), response.status_code
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'Secret Santa Email Proxy'}), 200

if __name__ == '__main__':
    print('🎅 Secret Santa Email Proxy Server')
    print('📧 Forwarding emails to Resend API')
    print('🌐 Running on http://localhost:5001')
    print('✅ CORS enabled for local development')
    print('\nReady to send invitations! 🎄\n')
    app.run(host='127.0.0.1', port=5001, debug=True)

