# SMTP Email Configuration

This application uses environment variables for SMTP configuration, making it easy to switch between different email providers without changing code.

## Local Development Setup

### Using Mailcatcher (Recommended)

Mailcatcher is a simple SMTP server that catches all sent emails and displays them in a web interface. It's already configured in `docker-compose.yml`.

**How it works:**
1. Start your Docker containers: `docker compose up`
2. Mailcatcher runs automatically on port 1025 (SMTP) and 1080 (Web UI)
3. Access the web interface at: http://localhost:1080
4. All emails sent by the application will appear here

**No additional setup needed!** The environment variables are already set in `docker-compose.yml`.

## Production Setup

### Environment Variables

Set these environment variables in your production environment:

```bash
# Required
SMTP_ADDRESS=smtp.gmail.com              # Your SMTP server address
SMTP_PORT=587                            # SMTP port (usually 587 for TLS, 465 for SSL)
SMTP_DOMAIN=yourdomain.com               # Your domain name
SMTP_USER_NAME=your-email@gmail.com      # SMTP username
SMTP_PASSWORD=your-app-password          # SMTP password or app password

# Optional (with defaults)
SMTP_AUTHENTICATION=plain                # Authentication method (plain, login, cram_md5)
SMTP_ENABLE_STARTTLS_AUTO=true          # Enable STARTTLS (true/false)
MAILER_FROM_EMAIL=noreply@yourdomain.com # Default from email address
MAILER_DEFAULT_HOST=yourdomain.com       # Host for links in emails
```

### Popular Email Providers

#### Gmail
```bash
SMTP_ADDRESS=smtp.gmail.com
SMTP_PORT=587
SMTP_DOMAIN=gmail.com
SMTP_USER_NAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password          # Generate at https://myaccount.google.com/apppasswords
SMTP_AUTHENTICATION=plain
SMTP_ENABLE_STARTTLS_AUTO=true
```

#### SendGrid
```bash
SMTP_ADDRESS=smtp.sendgrid.net
SMTP_PORT=587
SMTP_DOMAIN=yourdomain.com
SMTP_USER_NAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_AUTHENTICATION=plain
SMTP_ENABLE_STARTTLS_AUTO=true
```

#### AWS SES
```bash
SMTP_ADDRESS=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_DOMAIN=yourdomain.com
SMTP_USER_NAME=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
SMTP_AUTHENTICATION=plain
SMTP_ENABLE_STARTTLS_AUTO=true
```

#### Mailgun
```bash
SMTP_ADDRESS=smtp.mailgun.org
SMTP_PORT=587
SMTP_DOMAIN=yourdomain.com
SMTP_USER_NAME=postmaster@yourdomain.mailgun.org
SMTP_PASSWORD=your-mailgun-smtp-password
SMTP_AUTHENTICATION=plain
SMTP_ENABLE_STARTTLS_AUTO=true
```

## Testing Email Delivery

### In Rails Console

```ruby
# Open Rails console
docker compose exec web bin/rails console

# Send a test email
TestMailer.test_email('recipient@example.com').deliver_now

# Check if email was sent
# For development: Visit http://localhost:1080 to see the email
# For production: Check your email inbox
```

### Create a Test Mailer

Generate a test mailer:
```bash
docker compose exec web bin/rails generate mailer Test
```

## Troubleshooting

### Email not sending in development
1. Check if Mailcatcher is running: `docker compose ps`
2. Visit http://localhost:1080 - you should see the Mailcatcher web interface
3. Check Rails logs: `docker compose logs web`

### Email not sending in production
1. Verify all environment variables are set correctly
2. Check if your SMTP provider requires app-specific passwords (Gmail, Yahoo)
3. Ensure your IP is not blocked by the SMTP provider
4. Check Rails logs for error messages
5. Verify SMTP credentials are correct

### Common Issues

**Gmail "Less secure app access"**: Gmail requires app-specific passwords. Generate one at https://myaccount.google.com/apppasswords

**Port blocked**: Some hosting providers block port 25. Use port 587 (TLS) or 465 (SSL) instead.

**Authentication failed**: Double-check username and password. Some providers use API keys instead of passwords.

## Configuration Files

- Development config: `config/environments/development.rb`
- Production config: `config/environments/production.rb`
- Environment variables: `.env` (create from `.env.example`)
- Docker config: `docker-compose.yml`
