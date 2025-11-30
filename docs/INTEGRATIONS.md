# Integration Setup Guide

This guide explains how to configure third-party integrations for RepairForge. All integrations use a "Bring Your Own Key" (BYOK) model, meaning you provide your own API keys and credentials.

## Overview

RepairForge supports integrations with various third-party services:

- **Email**: SendGrid, Mailgun, Resend, AWS SES, Brevo
- **Payments**: Stripe, Square (coming soon)
- **SMS**: Twilio (coming soon)

All API keys are encrypted at rest using AES-256-GCM encryption and are never exposed in API responses.

## Email Integration

### Supported Providers

1. **SendGrid** (Recommended for MVP)
   - Free tier: 100 emails/day
   - Documentation: https://docs.sendgrid.com/for-developers/sending-email/api-getting-started

2. **Mailgun**
   - Free tier: 1,000 emails/month
   - Documentation: https://documentation.mailgun.com/en/latest/quickstart-sending.html

3. **Resend**
   - Free tier: 3,000 emails/month
   - Documentation: https://resend.com/docs

4. **AWS SES**
   - Free tier: 62,000 emails/month (first year)
   - Documentation: https://docs.aws.amazon.com/ses/

5. **Brevo** (formerly Sendinblue)
   - Free tier: 300 emails/day
   - Documentation: https://developers.brevo.com/

### Setting Up SendGrid

1. **Create a SendGrid Account**
   - Go to https://sendgrid.com
   - Sign up for a free account
   - Verify your email address

2. **Create an API Key**
   - Log in to SendGrid dashboard
   - Navigate to Settings → API Keys
   - Click "Create API Key"
   - Name it (e.g., "RepairForge Production")
   - Select "Full Access" or "Restricted Access" with "Mail Send" permission
   - Copy the API key (you won't be able to see it again)

3. **Verify Your Sender Identity**
   - Go to Settings → Sender Authentication
   - Verify a Single Sender or set up Domain Authentication
   - This is required to send emails

4. **Configure in RepairForge**
   - Log in as an administrator
   - Go to Settings → Email Integration
   - Select "SendGrid" as the provider
   - Enter your API key
   - Enter your "From Email" address (must be verified in SendGrid)
   - Optionally enter "From Name" and "Reply-To" email
   - Click "Test Connection" to verify
   - Click "Save Configuration"

### Email Notifications

Once configured, RepairForge will automatically send emails for:

- **Ticket Status Updates**: When a ticket status changes (new → in progress → completed, etc.)
- **Invoice Creation**: When an invoice is created and marked as "issued"
- **Payment Confirmation**: When an invoice is marked as paid

### Troubleshooting Email Integration

**Connection Test Fails**
- Verify your API key is correct
- Check that your SendGrid account is active
- Ensure your sender identity is verified in SendGrid

**Emails Not Sending**
- Check that email integration is enabled
- Verify the "From Email" address is verified in SendGrid
- Check SendGrid dashboard for bounce/spam reports
- Review application logs for error messages

**Emails Going to Spam**
- Set up SPF, DKIM, and DMARC records for your domain
- Use Domain Authentication in SendGrid (recommended)
- Avoid spam trigger words in email content
- Ensure your "From Email" matches your verified domain

## Security Best Practices

1. **API Key Security**
   - Never share your API keys
   - Rotate API keys periodically (every 90 days recommended)
   - Use different API keys for development and production
   - Monitor API key usage in your provider's dashboard

2. **Access Control**
   - Only administrators can configure integrations
   - API keys are encrypted at rest
   - Credentials are never exposed in API responses
   - All integration changes are logged

3. **Key Rotation**
   - When rotating an API key:
     1. Generate a new API key in your provider's dashboard
     2. Update the key in RepairForge settings
     3. Test the connection
     4. Delete the old API key from your provider (after confirming new key works)

## Future Integrations

### Payment Processing (Coming Soon)
- Stripe integration for online payments
- Square integration for in-person payments
- Payment method storage and processing

### SMS Notifications (Coming Soon)
- Twilio integration for SMS notifications
- Status update SMS alerts
- Appointment reminders

## Support

If you encounter issues setting up integrations:

1. Check the provider's documentation
2. Verify your API keys are correct
3. Test the connection using the "Test Connection" button
4. Review application logs for detailed error messages
5. Contact support if issues persist

## API Key Storage

All API keys are:
- Encrypted using AES-256-GCM encryption
- Stored securely in the database
- Never exposed in API responses (masked as `****`)
- Decrypted only when needed for API calls
- Isolated per company (multi-tenant)

Your encryption key is stored in the `ENCRYPTION_KEY` environment variable and should never be committed to version control.

