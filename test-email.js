// Test script to verify email configuration using Ethereal Email
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function main() {
  console.log('Email Test Script with Ethereal Email');
  console.log('=====================================');
  
  try {
    // Create a test account at Ethereal Email
    console.log('Creating test account at Ethereal Email...');
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('Test account created:');
    console.log('- User:', testAccount.user);
    console.log('- Password:', testAccount.pass);
    
    // Create a transporter using the test account
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    // Verify connection
    console.log('\nVerifying connection to Ethereal mail server...');
    await transporter.verify();
    console.log('✅ Connection successful!');
    
    // Send test email
    console.log('\nSending test email...');
    const info = await transporter.sendMail({
      from: `"Portfolio Contact" <${testAccount.user}>`,
      to: testAccount.user, // Send to self for testing
      subject: 'Test Email from Portfolio Contact Form',
      text: 'This is a test email to verify the email configuration.',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify the email configuration.</p>
        <p>If this test is successful, it means your Nodemailer setup is working correctly.</p>
        <p>The issue with Gmail might be related to:</p>
        <ul>
          <li>Incorrect app password</li>
          <li>2-Step Verification not enabled</li>
          <li>Custom domain not properly configured</li>
          <li>SMTP access not enabled for your Google Workspace account</li>
        </ul>
      `,
    });
    
    console.log('✅ Email sent successfully!');
    console.log('- Message ID:', info.messageId);
    console.log('- Preview URL:', nodemailer.getTestMessageUrl(info));
    console.log('\nVisit the preview URL to see the test email.');
    
    console.log('\nNext steps for Gmail:');
    console.log('1. Verify that 2-Step Verification is enabled for your Google account');
    console.log('2. Generate a new App Password specifically for this application');
    console.log('3. Update your .env.local file with the new App Password');
    console.log('4. If using a custom domain with Google Workspace, ensure SMTP is enabled');
    console.log('5. Consider using a different email provider if issues persist');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error); 