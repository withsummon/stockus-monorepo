import { Resend } from 'resend'
import { env } from '../config/env.js'

const resend = new Resend(env.RESEND_API_KEY)

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send email verification link to new user
 */
export async function sendVerificationEmail(
  to: string,
  token: string,
  userName: string
): Promise<EmailResult> {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`

  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: 'Verify your StockUs account',
      html: `
        <h2>Welcome to StockUs, ${userName}!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationUrl}">Verify Email</a></p>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      `,
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
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`

  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: 'Reset your StockUs password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
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
  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: 'Your StockUs password was changed',
      html: `
        <h2>Password Changed</h2>
        <p>Your password has been successfully changed.</p>
        <p>If you did not make this change, please contact support immediately.</p>
      `,
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

  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: `Payment Receipt - ${itemName}`,
      html: `
        <h2>Payment Successful!</h2>
        <p>Hi ${userName},</p>
        <p>Thank you for your purchase. Here are your payment details:</p>
        <table style="border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Order ID</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${orderId}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Item</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${itemName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formattedAmount}</td>
          </tr>
        </table>
        <p>If you have any questions about your purchase, please contact our support team.</p>
        <p>Thank you for choosing StockUs!</p>
      `,
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
