require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function testGmailCredentials() {
  console.log('Testing Gmail credentials with the following configuration:');
  console.log('- Email User:', process.env.EMAIL_USER);
  console.log('- Email Server:', process.env.EMAIL_SERVER);
  console.log('- Email Port:', process.env.EMAIL_PORT);
  console.log('- Email Secure:', process.env.EMAIL_SECURE);
  
  try {
    // Create a test account if no credentials are provided
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('No email credentials found in .env.local file');
      return;
    }
    
    // Create a transporter with Gmail - using direct configuration
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      debug: true, // Show debug output
      logger: true // Log information about the mail
    });
    
    // Verify connection configuration
    console.log('Verifying connection to mail server...');
    await transporter.verify();
    console.log('✅ Server connection successful!');
    
    // Send mail with defined transport object
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"Test Email" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
      subject: 'Test Email from Portfolio Contact Form',
      text: 'This is a test email to verify the Gmail configuration with the new App Password.',
      html: '<b>This is a test email to verify the Gmail configuration with the new App Password.</b>',
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    if (error.code === 'EAUTH') {
      console.error('\nAuthentication Error: Invalid username or password');
      console.error('\nTroubleshooting steps for Gmail:');
      console.error('1. Make sure 2-Step Verification is enabled on your Google account');
      console.error('2. Generate an App Password at https://myaccount.google.com/apppasswords');
      console.error('3. Use the App Password instead of your regular password');
      console.error('4. Check that the email address is correct');
      console.error('5. If using a custom domain with Gmail/Google Workspace:');
      console.error('   - Make sure your domain is properly configured in Google Workspace');
      console.error('   - Check SMTP settings in Google Admin Console');
      console.error('   - Ensure SMTP access is enabled for your account');
    }
  }
}

testGmailCredentials(); 