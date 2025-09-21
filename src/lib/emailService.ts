import nodemailer from 'nodemailer';

export interface EmailService {
  sendVerificationCode: (email: string, code: string, name: string) => Promise<void>;
  sendEmailChangeVerification: (email: string, code: string, name: string) => Promise<void>;
  sendPasswordResetCode: (email: string, code: string, name: string) => Promise<void>;
}

class GmailEmailService implements EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST!,
      port: parseInt(process.env.EMAIL_PORT!),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASSWORD!,
      },
    });
  }

  async sendVerificationCode(email: string, code: string, name: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: 'Verify Your AI Arcade Account - Verification Code',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">AI Arcade</h1>
            <p style="color: #6b7280; margin: 5px 0;">Welcome to the future of AI tools</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: white; margin: 0 0 10px 0;">Verify Your Account</h2>
            <p style="color: rgba(255,255,255,0.9); margin: 0;">Enter this code to complete your registration</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block;">
              <p style="margin: 0 0 10px 0; color: #374151; font-size: 14px;">Your verification code is:</p>
              <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</div>
            </div>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⏱️ This code expires in 10 minutes</strong><br>
              Don't share this code with anyone. AI Arcade will never ask for your verification code.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              If you didn't create an account with AI Arcade, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
      text: `
Welcome to AI Arcade!

Hi ${name},

Your verification code is: ${code}

Enter this code to complete your account registration.

This code expires in 10 minutes.

If you didn't create an account with AI Arcade, you can safely ignore this email.

Best regards,
AI Arcade Team
      `.trim()
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Verification email sent successfully to:', email);
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendEmailChangeVerification(email: string, code: string, name: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: 'AI Arcade - Verify Your New Email Address',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">AI Arcade</h1>
            <p style="color: #6b7280; margin: 5px 0;">Email Change Verification</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: white; margin: 0 0 10px 0;">Verify Your New Email</h2>
            <p style="color: rgba(255,255,255,0.9); margin: 0;">You requested to change your email address. Please verify this new email address.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block;">
              <p style="margin: 0 0 10px 0; color: #374151; font-size: 14px;">Your verification code is:</p>
              <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</div>
            </div>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⏱️ This code expires in 10 minutes</strong><br>
              If you didn't request this email change, please ignore this email and contact support.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This email change was requested from your AI Arcade account.
            </p>
          </div>
        </div>
      `,
      text: `
AI Arcade - Email Change Verification

Hi ${name},

You requested to change your email address to this new email.

Your verification code is: ${code}

Enter this code in the settings page to complete your email change.

This code expires in 10 minutes.

If you didn't request this email change, please ignore this email and contact support.

Best regards,
AI Arcade Team
      `.trim()
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Email change verification sent successfully to:', email);
    } catch (error) {
      console.error('❌ Failed to send email change verification:', error);
      throw new Error('Failed to send email change verification');
    }
  }

  async sendPasswordResetCode(email: string, code: string, name: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: 'AI Arcade - Reset Your Password',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">AI Arcade</h1>
            <p style="color: #6b7280; margin: 5px 0;">Password Reset Request</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: white; margin: 0 0 10px 0;">🔒 Reset Your Password</h2>
            <p style="color: rgba(255,255,255,0.9); margin: 0;">You requested to reset your password. Use the code below to create a new password.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block;">
              <p style="margin: 0 0 10px 0; color: #374151; font-size: 14px;">Your password reset code is:</p>
              <div style="font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</div>
            </div>
          </div>
          
          <div style="background: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #b91c1c; font-size: 14px;">
              <strong>⏱️ This code expires in 15 minutes</strong><br>
              <strong>🔐 Keep this code secure!</strong> Don't share it with anyone. If you didn't request a password reset, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <p style="color: #374151; font-size: 14px;">
              After entering your code, you'll be able to create a new password for your account.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This password reset was requested from your AI Arcade account.<br>
              If you didn't make this request, please contact our support team.
            </p>
          </div>
        </div>
      `,
      text: `
AI Arcade - Password Reset

Hi ${name},

You requested to reset your password for your AI Arcade account.

Your password reset code is: ${code}

Enter this code along with your new password to complete the reset process.

IMPORTANT:
- This code expires in 15 minutes
- Don't share this code with anyone
- If you didn't request this reset, please ignore this email

After entering your code, you'll be able to create a new password for your account.

Best regards,
AI Arcade Team
      `.trim()
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully to:', email);
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}

export const emailService = new GmailEmailService();