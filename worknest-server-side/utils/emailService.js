const nodemailer = require("nodemailer");

/**
 * Universal Email Service
 * Supports: Gmail, Outlook, SendGrid, Mailtrap, and custom SMTP
 */

// Email provider configurations
const emailProviders = {
  gmail: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
  },
  outlook: {
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
  },
  sendgrid: {
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
  },
  mailtrap: {
    host: "smtp.mailtrap.io",
    port: 2525,
    secure: false,
  },
  custom: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
  },
};

// Get provider configuration
const getProviderConfig = () => {
  const provider = process.env.EMAIL_PROVIDER || "gmail";
  return emailProviders[provider] || emailProviders.custom;
};

// Create transporter
const createTransporter = () => {
  const config = getProviderConfig();

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email service is ready");
    return true;
  } catch (error) {
    console.error("Email service verification failed:", error.message);
    return false;
  }
};

// Send email with retry logic
const sendEmail = async (to, subject, text, html = null, options = {}) => {
  const maxRetries = options.maxRetries || 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from:
          options.from ||
          `"${process.env.APP_NAME || "WorkNest"}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html: html || text,
        replyTo: options.replyTo || process.env.EMAIL_USER,
      };

      if (options.attachments) {
        mailOptions.attachments = options.attachments;
      }

      const info = await transporter.sendMail(mailOptions);
      console.log(
        `Email sent successfully to ${to} (Attempt ${attempt}/${maxRetries})`
      );
      console.log("Message ID:", info.messageId);

      return {
        success: true,
        messageId: info.messageId,
        to,
        subject,
      };
    } catch (error) {
      lastError = error;
      console.error(
        `Email sending failed (Attempt ${attempt}/${maxRetries}):`,
        error.message
      );

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw new Error(
    `Failed to send email after ${maxRetries} attempts: ${lastError.message}`
  );
};

// Email templates
const emailTemplates = {
  welcomeEmail: (name, loginUrl) => ({
    subject: "Welcome to WorkNest! ",
    text: `Hi ${
      name || "there"
    },\n\nWelcome to WorkNest! Your account has been successfully created.\n\nYou can now log in and start managing your workspace.\n\nLogin here: ${loginUrl}\n\nBest regards,\nThe WorkNest Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to WorkNest! </h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Hi ${name || "there"},</p>
          <p style="font-size: 16px; color: #333;">Welcome to WorkNest! Your account has been successfully created.</p>
          <p style="font-size: 16px; color: #333;">You can now log in and start managing your workspace.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" 
               style="background-color: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you didn't create this account, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Best regards,<br>
            The WorkNest Team
          </p>
        </div>
      </div>
    `,
  }),

  bookingConfirmation: (name, bookingDetails) => ({
    subject: "Booking Confirmation - WorkNest",
    text: `Hi ${name},\n\nYour booking has been confirmed!\n\nDetails:\n- Date: ${bookingDetails.date}\n- Time: ${bookingDetails.time}\n- Location: ${bookingDetails.location}\n\nBest regards,\nThe WorkNest Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Booking Confirmation ✓</h2>
        <p>Hi ${name},</p>
        <p>Your booking has been confirmed!</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details:</h3>
          <p><strong>Date:</strong> ${bookingDetails.date}</p>
          <p><strong>Time:</strong> ${bookingDetails.time}</p>
          <p><strong>Location:</strong> ${bookingDetails.location}</p>
        </div>
        <p style="color: #666; font-size: 14px;">Best regards,<br>The WorkNest Team</p>
      </div>
    `,
  }),

  passwordReset: (name, resetUrl) => ({
    subject: "Password Reset Request - WorkNest",
    text: `Hi ${name},\n\nWe received a request to reset your password.\n\nReset your password here: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe WorkNest Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #9ca3af; font-size: 12px;">Best regards,<br>The WorkNest Team</p>
      </div>
    `,
  }),

  //  NEW GUEST MODE TEMPLATES

  guestWaitingList: (name, email) => ({
    subject: "Guest Access Request Received - WorkNest",
    text: `Hi ${name},\n\nThank you for your interest in WorkNest!\n\nWe have received your guest access request and added you to our waiting list.\n\nOur team will review your request shortly. You will receive another email once your request is approved.\n\nYour Details:\n- Name: ${name}\n- Email: ${email}\n\nTypically, requests are reviewed within 24 hours.\n\nBest regards,\nThe WorkNest Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;"> Request Received</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Hi ${name},</p>
          <p style="font-size: 16px; color: #333;">Thank you for your interest in WorkNest!</p>
          <p style="font-size: 16px; color: #333;">We have received your guest access request and added you to our waiting list.</p>
          
          <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #667eea;">Your Details:</h3>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
          </div>

          <p style="font-size: 16px; color: #333;">Our team will review your request shortly. You will receive another email once your request is approved.</p>
          
          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              ⏱ <strong>Estimated Review Time:</strong> Within 24 hours
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Best regards,<br>
            The WorkNest Team
          </p>
        </div>
      </div>
    `,
  }),

  guestApproved: (name, demoUrl, expiryHours) => ({
    subject: " Guest Access Approved - Welcome to WorkNest Demo!",
    text: `Hi ${name},\n\nGreat news! Your guest access request has been approved.\n\nYou now have access to our demo dashboard where you can explore WorkNest's features.\n\nAccess the demo: ${demoUrl}\n\nIMPORTANT:\n- Your access will expire in ${expiryHours} hours\n- This is a demo environment with sample data\n- Some features may be limited\n\nGet started now and see how WorkNest can transform your workspace management!\n\nBest regards,\nThe WorkNest Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;"> Access Approved!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Hi ${name},</p>
          <p style="font-size: 18px; color: #10b981; font-weight: bold;">Great news! Your guest access request has been approved.</p>
          
          <p style="font-size: 16px; color: #333;">You now have access to our demo dashboard where you can explore WorkNest's features.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${demoUrl}" 
               style="background-color: #10b981; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
              🚀 Access Demo Dashboard
            </a>
          </div>

          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #92400e;"> Important Information:</h3>
            <ul style="color: #92400e; margin: 10px 0; padding-left: 20px;">
              <li style="margin: 8px 0;">Your access will expire in <strong>${expiryHours} hours</strong></li>
              <li style="margin: 8px 0;">This is a demo environment with sample data</li>
              <li style="margin: 8px 0;">Some features may be limited or view-only</li>
            </ul>
          </div>

          <div style="background: white; border: 2px solid #667eea; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #667eea;"> What You Can Explore:</h3>
            <ul style="color: #333; margin: 10px 0; padding-left: 20px;">
              <li style="margin: 8px 0;">Workspace management dashboard</li>
              <li style="margin: 8px 0;">Desk booking system</li>
              <li style="margin: 8px 0;">Meeting room reservations</li>
              <li style="margin: 8px 0;">Real-time availability</li>
              <li style="margin: 8px 0;">Analytics and reporting</li>
            </ul>
          </div>

          <p style="font-size: 16px; color: #333;">Get started now and see how WorkNest can transform your workspace management!</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Best regards,<br>
            The WorkNest Team
          </p>
        </div>
      </div>
    `,
  }),

  guestRejected: (name, reason) => ({
    subject: "Guest Access Request Update - WorkNest",
    text: `Hi ${name},\n\nThank you for your interest in WorkNest.\n\nUnfortunately, we are unable to approve your guest access request at this time.\n\nReason: ${reason}\n\nIf you have any questions or would like to discuss this further, please feel free to contact our support team.\n\nBest regards,\nThe WorkNest Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Request Update</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Hi ${name},</p>
          <p style="font-size: 16px; color: #333;">Thank you for your interest in WorkNest.</p>
          <p style="font-size: 16px; color: #333;">Unfortunately, we are unable to approve your guest access request at this time.</p>
          
          <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong> ${reason}</p>
          </div>

          <p style="font-size: 16px; color: #333;">If you have any questions or would like to discuss this further, please feel free to contact our support team.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${process.env.EMAIL_USER}" 
               style="background-color: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Contact Support
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Best regards,<br>
            The WorkNest Team
          </p>
        </div>
      </div>
    `,
  }),
};

const sendTemplatedEmail = async (to, templateName, templateData = {}) => {
  const template = emailTemplates[templateName];
  if (!template) {
    throw new Error(`Email template '${templateName}' not found`);
  }

  let emailContent;

  if (typeof template === "function") {
    // Extract values from templateData object in the correct order
    if (templateName === "welcomeEmail") {
      emailContent = template(templateData.name, templateData.loginUrl);
    } else if (templateName === "bookingConfirmation") {
      emailContent = template(templateData.name, templateData.bookingDetails);
    } else if (templateName === "passwordReset") {
      emailContent = template(templateData.name, templateData.resetUrl);
    } else if (templateName === "guestWaitingList") {
      emailContent = template(templateData.name, templateData.email);
    } else if (templateName === "guestApproved") {
      emailContent = template(
        templateData.name,
        templateData.demoUrl,
        templateData.expiryHours
      );
    } else if (templateName === "guestRejected") {
      emailContent = template(templateData.name, templateData.reason);
    } else {
      // Fallback for other templates
      emailContent = template(...Object.values(templateData));
    }
  } else {
    emailContent = template;
  }

  return sendEmail(
    to,
    emailContent.subject,
    emailContent.text,
    emailContent.html
  );
};

module.exports = {
  sendEmail,
  sendTemplatedEmail,
  verifyEmailConfig,
  emailTemplates,
};
