# Quick SMTP Setup Guide

## Local Development (Already Configured!)

1. **Start Docker containers:**
   ```bash
   docker compose up
   ```

2. **Access Mailcatcher web interface:**
   - Open browser: http://localhost:1080
   - All emails will appear here

3. **Test email sending:**
   ```bash
   # Open Rails console
   docker compose exec web bin/rails console
   
   # Send test email
   TestMailer.test_email('test@example.com').deliver_now
   
   # Check http://localhost:1080 to see the email
   ```

## Production Setup

1. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. **Update SMTP settings in `.env`:**
   ```bash
   # Example for Gmail:
   SMTP_ADDRESS=smtp.gmail.com
   SMTP_PORT=587
   SMTP_DOMAIN=gmail.com
   SMTP_USER_NAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_AUTHENTICATION=plain
   SMTP_ENABLE_STARTTLS_AUTO=true
   MAILER_FROM_EMAIL=noreply@yourdomain.com
   MAILER_DEFAULT_HOST=yourdomain.com
   ```

3. **For Gmail users:**
   - Enable 2-factor authentication
   - Generate app password: https://myaccount.google.com/apppasswords
   - Use the app password (not your regular password)

## Environment Variables Reference

| Variable | Development Default | Required in Production | Example |
|----------|-------------------|----------------------|---------|
| SMTP_ADDRESS | mailcatcher | Yes | smtp.gmail.com |
| SMTP_PORT | 1025 | No (default: 587) | 587 |
| SMTP_DOMAIN | localhost | Yes | yourdomain.com |
| SMTP_USER_NAME | - | Yes | your-email@gmail.com |
| SMTP_PASSWORD | - | Yes | your-app-password |
| SMTP_AUTHENTICATION | plain | No (default: plain) | plain |
| SMTP_ENABLE_STARTTLS_AUTO | false | No (default: true) | true |
| MAILER_FROM_EMAIL | noreply@pilotts.com | No | noreply@yourdomain.com |
| MAILER_DEFAULT_HOST | localhost:3000 | Yes | yourdomain.com |

## Popular Email Providers Quick Config

### Gmail
```bash
SMTP_ADDRESS=smtp.gmail.com
SMTP_PORT=587
SMTP_USER_NAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### SendGrid
```bash
SMTP_ADDRESS=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER_NAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### Mailgun
```bash
SMTP_ADDRESS=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER_NAME=postmaster@yourdomain.mailgun.org
SMTP_PASSWORD=your-mailgun-smtp-password
```

For detailed setup instructions, see [docs/SMTP_SETUP.md](SMTP_SETUP.md)
