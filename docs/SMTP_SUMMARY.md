# SMTP Email Setup - Summary

## ✅ What Was Configured

### 1. Local Development (Mailcatcher)
- **Service**: Mailcatcher container added to `docker-compose.yml`
- **SMTP Port**: 1025
- **Web Interface**: http://localhost:1080
- **Auto-configured**: No setup needed, works out of the box!

### 2. Environment Variables
All SMTP settings now configurable via environment variables:

**Files Updated:**
- `.env.example` - Template with all SMTP variables and examples for popular providers
- `config/environments/development.rb` - Uses env vars with sensible defaults
- `config/environments/production.rb` - Uses env vars for production
- `docker-compose.yml` - Includes Mailcatcher service and env vars

**Variables Available:**
- `SMTP_ADDRESS` - SMTP server address
- `SMTP_PORT` - SMTP port (default: 587)
- `SMTP_DOMAIN` - Your domain
- `SMTP_USER_NAME` - SMTP username
- `SMTP_PASSWORD` - SMTP password
- `SMTP_AUTHENTICATION` - Auth method (default: plain)
- `SMTP_ENABLE_STARTTLS_AUTO` - Enable TLS (default: true)
- `MAILER_FROM_EMAIL` - Default from address
- `MAILER_DEFAULT_HOST` - Host for email links

### 3. Test Mailer
Created `TestMailer` with both HTML and text templates:
- `app/mailers/test_mailer.rb`
- `app/views/test_mailer/test_email.html.erb`
- `app/views/test_mailer/test_email.text.erb`

### 4. Documentation
- `docs/SMTP_SETUP.md` - Complete setup guide with troubleshooting
- `docs/SMTP_QUICK_START.md` - Quick reference guide
- `README.md` - Updated with email configuration section

### 5. Testing Script
- `script/test_email.rb` - Interactive script to test email sending

## 🚀 How to Use

### Local Development
```bash
# 1. Start containers (Mailcatcher starts automatically)
docker compose up

# 2. Send test email
docker compose exec web bin/rails console
TestMailer.test_email('test@example.com').deliver_now

# 3. View email at http://localhost:1080
```

### Production
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env with your SMTP settings
nano .env

# 3. Set these required variables:
SMTP_ADDRESS=smtp.gmail.com
SMTP_PORT=587
SMTP_USER_NAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_DOMAIN=yourdomain.com
MAILER_FROM_EMAIL=noreply@yourdomain.com
MAILER_DEFAULT_HOST=yourdomain.com
```

## 📋 Pre-configured Email Providers

The `.env.example` includes configurations for:
- ✉️ Gmail
- ✉️ SendGrid
- ✉️ AWS SES
- ✉️ Mailgun

Just uncomment and fill in your credentials!

## 🔧 Testing Email

### Method 1: Rails Console
```bash
docker compose exec web bin/rails console
TestMailer.test_email('recipient@example.com').deliver_now
```

### Method 2: Test Script
```bash
docker compose exec web bin/rails runner script/test_email.rb
# Follow the prompts
```

## 📦 What's Included in Mailcatcher

Mailcatcher is a development email server that:
- ✓ Catches all outgoing emails
- ✓ Provides web interface to view emails
- ✓ Supports HTML and text formats
- ✓ Shows email headers and attachments
- ✓ No configuration needed
- ✓ Automatically included in Docker setup

## 🎯 Next Steps

1. **Restart your containers** to pick up the new Mailcatcher service:
   ```bash
   docker compose down
   docker compose up
   ```

2. **Test the email system**:
   - Visit http://localhost:1080 (should see Mailcatcher interface)
   - Send a test email using the Rails console
   - Watch the email appear in Mailcatcher

3. **For production**, update your environment variables with real SMTP credentials

## 🆘 Troubleshooting

**Mailcatcher not accessible?**
```bash
# Check if service is running
docker compose ps

# Should show mailcatcher service running
# If not, restart:
docker compose restart mailcatcher
```

**Emails not appearing?**
```bash
# Check Rails logs
docker compose logs web

# Check Mailcatcher logs
docker compose logs mailcatcher
```

**Port conflicts?**
If port 1080 or 1025 is already in use, edit `docker-compose.yml`:
```yaml
mailcatcher:
  ports:
    - "1081:1080"  # Change web port
    - "1026:1025"  # Change SMTP port
```

## 📚 Additional Resources

- Full setup guide: [docs/SMTP_SETUP.md](SMTP_SETUP.md)
- Quick reference: [docs/SMTP_QUICK_START.md](SMTP_QUICK_START.md)
- Mailcatcher docs: https://mailcatcher.me/
