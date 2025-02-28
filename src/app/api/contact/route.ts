import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { initializeDatabase, saveContact } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Parse request body
    const body = await req.json();
    const { name, email, message, phone, service } = body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Log the email configuration for debugging
    console.log('Creating Gmail transporter with:', {
      host: process.env.EMAIL_SERVER,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        // Password is not logged for security reasons
      }
    });
    
    // Create transporter with Gmail - using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: true,
      },
      debug: true, // Enable debugging
    });
    
    // Format the current date
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Prepare email content with improved HTML formatting
    const mailOptions = {
      from: `"Giovanni's Portfolio" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
      subject: `New Contact Form Submission: ${name}`,
      text: `
New Contact Form Submission

Date: ${currentDate}

CONTACT DETAILS
--------------
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Service Requested: ${service || 'Not specified'}

MESSAGE
-------
${message}

This message was sent from your portfolio website contact form.
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #f5f5f5;
      max-width: 600px;
      margin: 0 auto;
      background-color: #f5f5f5;
    }
    .container {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .header {
      background-color: #000000;
      color: white;
      padding: 24px;
      text-align: center;
    }
    .content {
      padding: 24px;
      background-color: #121212;
    }
    .section {
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid #2a2a2a;
    }
    .section:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .label {
      font-weight: 600;
      color: #9e9e9e;
      margin-bottom: 6px;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
    }
    .value {
      margin-bottom: 16px;
      font-size: 16px;
    }
    .message-box {
      background-color: #1a1a1a;
      padding: 18px;
      border-radius: 6px;
      border-left: 4px solid #555555;
    }
    .footer {
      background-color: #000000;
      padding: 16px;
      text-align: center;
      font-size: 12px;
      color: #9e9e9e;
    }
    .date {
      font-style: italic;
      color: #9e9e9e;
      margin-bottom: 24px;
      font-size: 14px;
    }
    h2 {
      color: #ffffff;
      font-weight: 500;
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px; font-weight: 500;">New Contact Form Submission</h1>
    </div>
    
    <div class="content">
      <div class="date">Received on ${currentDate}</div>
      
      <div class="section">
        <h2>Contact Details</h2>
        
        <div class="label">Name</div>
        <div class="value">${name}</div>
        
        <div class="label">Email</div>
        <div class="value">${email}</div>
        
        <div class="label">Phone</div>
        <div class="value">${phone || '<em style="color: #757575;">Not provided</em>'}</div>
        
        <div class="label">Service Requested</div>
        <div class="value">${service || '<em style="color: #757575;">Not specified</em>'}</div>
      </div>
      
      <div class="section">
        <h2>Message</h2>
        <div class="message-box">
          ${message.replace(/\n/g, '<br>')}
        </div>
      </div>
    </div>
    
    <div class="footer">
      This message was sent from your portfolio website contact form.
    </div>
  </div>
</body>
</html>
      `,
    };
    
    // Send email
    try {
      console.log('Attempting to send email to:', process.env.EMAIL_TO);
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      
      // Store contact in database
      const contactResult = await saveContact(name, phone || '');
      
      return NextResponse.json(
        { 
          success: true, 
          message: 'Message sent successfully'
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Error sending email:', error);
      
      // Create user-friendly error message
      let errorMessage = 'Failed to send email. Please try again later.';
      
      if (error.code === 'EAUTH') {
        errorMessage = 'Authentication failed. Please check email credentials.';
        console.error('Authentication error details:', error.message);
        console.error('Please make sure you have:');
        console.error('1. Enabled 2-Step Verification on your Google account');
        console.error('2. Generated an App Password for this application');
        console.error('3. Used the correct App Password in your .env.local file');
      } else if (error.code === 'ESOCKET') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      return NextResponse.json(
        { error: errorMessage, details: error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
} 