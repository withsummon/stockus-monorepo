import { Resend } from 'resend'
import { env } from '../config/env.js'

const resend = new Resend(env.RESEND_API_KEY)

/**
 * Escape HTML special characters to prevent HTML injection in emails
 */
function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  }
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char])
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Email template wrapper with consistent branding
function emailTemplate(content: string, preheader: string = ''): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>StockUs</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Preheader text (hidden) -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${preheader}
  </div>

  <!-- Email container -->
  <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Header with logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #E07A3A 0%, #c96a2f 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                StockUs
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Your Investment Learning Platform
              </p>
            </td>
          </tr>

          <!-- Email content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 24px 40px; border-top: 1px solid #eee;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #666; font-size: 13px;">
                      Need help? Contact us at <a href="mailto:support@stockus.id" style="color: #E07A3A; text-decoration: none;">support@stockus.id</a>
                    </p>
                    <p style="margin: 0; color: #999; font-size: 12px;">
                      © ${new Date().getFullYear()} StockUs. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Unsubscribe note -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 16px auto 0;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; color: #999; font-size: 11px;">
                This email was sent to you because you have an account with StockUs.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

// Reusable button component
function emailButton(text: string, url: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="background: linear-gradient(135deg, #E07A3A 0%, #c96a2f 100%); border-radius: 8px;">
          <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `
}

// Info box component
function infoBox(content: string, type: 'info' | 'warning' | 'success' = 'info'): string {
  const colors = {
    info: { bg: '#f0f7ff', border: '#3b82f6', icon: 'ℹ️' },
    warning: { bg: '#fffbeb', border: '#f59e0b', icon: '⚠️' },
    success: { bg: '#f0fdf4', border: '#22c55e', icon: '✓' },
  }
  const { bg, border, icon } = colors[type]

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 20px 0;">
      <tr>
        <td style="background-color: ${bg}; border-left: 4px solid ${border}; padding: 16px; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #374151; font-size: 14px;">
            ${icon} ${content}
          </p>
        </td>
      </tr>
    </table>
  `
}

/**
 * Send email verification link to new user
 */
export async function sendVerificationEmail(
  to: string,
  token: string,
  userName: string
): Promise<EmailResult> {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`
  const firstName = escapeHtml(userName.split(' ')[0])

  const content = `
    <h2 style="margin: 0 0 8px 0; color: #111827; font-size: 24px; font-weight: 600;">
      Welcome to StockUs! 🎉
    </h2>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
      Hi ${firstName}, we're excited to have you on board!
    </p>

    <p style="margin: 0 0 8px 0; color: #374151; font-size: 15px; line-height: 1.6;">
      To get started with your investment learning journey, please verify your email address by clicking the button below:
    </p>

    ${emailButton('Verify My Email', verificationUrl)}

    <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">
      Or copy and paste this link into your browser:
    </p>
    <p style="margin: 0 0 24px 0; color: #E07A3A; font-size: 13px; word-break: break-all;">
      ${verificationUrl}
    </p>

    ${infoBox('This verification link will expire in 24 hours.', 'info')}

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

    <p style="margin: 0; color: #9ca3af; font-size: 13px;">
      If you didn't create an account with StockUs, you can safely ignore this email.
    </p>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: '🎉 Verify your StockUs account',
      html: emailTemplate(content, `Hi ${firstName}, please verify your email to get started with StockUs.`),
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }
  }
}

/**
 * Send password reset link
 */
export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<EmailResult> {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`

  const content = `
    <h2 style="margin: 0 0 8px 0; color: #111827; font-size: 24px; font-weight: 600;">
      Reset Your Password 🔐
    </h2>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
      We received a request to reset your password.
    </p>

    <p style="margin: 0 0 8px 0; color: #374151; font-size: 15px; line-height: 1.6;">
      Click the button below to create a new password:
    </p>

    ${emailButton('Reset Password', resetUrl)}

    <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">
      Or copy and paste this link into your browser:
    </p>
    <p style="margin: 0 0 24px 0; color: #E07A3A; font-size: 13px; word-break: break-all;">
      ${resetUrl}
    </p>

    ${infoBox('This link will expire in 1 hour for your security.', 'warning')}

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

    <p style="margin: 0; color: #9ca3af; font-size: 13px;">
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: '🔐 Reset your StockUs password',
      html: emailTemplate(content, 'Reset your password to regain access to your StockUs account.'),
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }
  }
}

/**
 * Send password changed notification
 */
export async function sendPasswordChangedEmail(to: string): Promise<EmailResult> {
  const content = `
    <h2 style="margin: 0 0 8px 0; color: #111827; font-size: 24px; font-weight: 600;">
      Password Changed Successfully ✓
    </h2>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
      Your StockUs account password has been updated.
    </p>

    ${infoBox('Your password was successfully changed. You can now use your new password to sign in.', 'success')}

    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 24px 0; background-color: #fef2f2; border-radius: 8px; padding: 16px;">
      <tr>
        <td style="padding: 16px;">
          <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px; font-weight: 600;">
            🚨 Didn't make this change?
          </p>
          <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.5;">
            If you didn't change your password, your account may be compromised. Please <a href="${env.FRONTEND_URL}/forgot-password" style="color: #dc2626; font-weight: 600;">reset your password immediately</a> and contact our support team.
          </p>
        </td>
      </tr>
    </table>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

    <p style="margin: 0; color: #9ca3af; font-size: 13px;">
      This is an automated security notification. No action is required if you made this change.
    </p>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: '✓ Your StockUs password was changed',
      html: emailTemplate(content, 'Your StockUs account password has been successfully updated.'),
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }
  }
}

/**
 * Send payment receipt email after successful payment
 * Called from webhook handler (non-blocking)
 */
export async function sendPaymentReceiptEmail(
  to: string,
  userName: string,
  orderId: string,
  amount: number,
  itemName: string
): Promise<EmailResult> {
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)

  const firstName = escapeHtml(userName.split(' ')[0])
  const safeOrderId = escapeHtml(orderId)
  const safeItemName = escapeHtml(itemName)
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background-color: #f0fdf4; border-radius: 50%; padding: 16px; margin-bottom: 16px;">
        <span style="font-size: 32px;">✓</span>
      </div>
      <h2 style="margin: 0 0 8px 0; color: #111827; font-size: 24px; font-weight: 600;">
        Payment Successful!
      </h2>
      <p style="margin: 0; color: #6b7280; font-size: 16px;">
        Thank you for your purchase, ${firstName}!
      </p>
    </div>

    <!-- Receipt Card -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #fafafa; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
      <tr>
        <td style="padding: 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              <td style="padding-bottom: 16px; border-bottom: 1px dashed #e5e7eb;">
                <p style="margin: 0 0 4px 0; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</p>
                <p style="margin: 0; color: #374151; font-size: 14px; font-family: monospace;">${safeOrderId}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 0; border-bottom: 1px dashed #e5e7eb;">
                <p style="margin: 0 0 4px 0; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Date</p>
                <p style="margin: 0; color: #374151; font-size: 14px;">${currentDate}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 0; border-bottom: 1px dashed #e5e7eb;">
                <p style="margin: 0 0 4px 0; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Item</p>
                <p style="margin: 0; color: #374151; font-size: 14px; font-weight: 500;">${safeItemName}</p>
              </td>
            </tr>
            <tr>
              <td style="padding-top: 16px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
                  <tr>
                    <td>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Total Paid</p>
                    </td>
                    <td style="text-align: right;">
                      <p style="margin: 0; color: #E07A3A; font-size: 24px; font-weight: 700;">${formattedAmount}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${infoBox('Your access has been activated. You can now enjoy all the premium features!', 'success')}

    ${emailButton('Go to Dashboard', `${env.FRONTEND_URL}/dashboard`)}

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

    <p style="margin: 0; color: #9ca3af; font-size: 13px; text-align: center;">
      Questions about your purchase? Contact us at <a href="mailto:support@stockus.id" style="color: #E07A3A;">support@stockus.id</a>
    </p>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: `✓ Payment Receipt - ${safeItemName}`,
      html: emailTemplate(content, `Thank you for your purchase! Your payment of ${formattedAmount} has been confirmed.`),
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }
  }
}
