# RuboCop Setup Complete

## What Was Installed

### Gems in Gemfile
```ruby
gem "rubocop-rails-omakase", require: false
```

**Note**: Uses the default Rails Omakase style guide that comes with Rails 8.

## Configuration

### .rubocop.yml
The project uses **rubocop-rails-omakase** as the base configuration:

```yaml
# Omakase Ruby styling for Rails
inherit_gem:
  rubocop-rails-omakase: rubocop.yml

# Overwrite or add rules to create your own house style
```

#### What is Omakase?

Omakase (おまかせ) means "I'll leave it up to you" in Japanese. The rubocop-rails-omakase gem provides:

- **Rails-optimized rules**: Designed specifically for Rails applications
- **Modern Ruby conventions**: Up-to-date with current best practices  
- **Sensible defaults**: Works great out of the box
- **Maintained by Rails team**: Official Rails style guide

#### Key Features

- ✅ Frozen string literals enforced
- ✅ Modern hash syntax
- ✅ Consistent indentation and spacing
- ✅ Rails-specific cops enabled
- ✅ Line length: 120 characters (Omakase default)
- ✅ Auto-correctable rules enabled

## Next Steps

### 1. Install Gems
```bash
docker compose run --rm web bundle install
docker compose restart web
```

### 2. Run RuboCop
```bash
# Check all files
docker compose run --rm web bundle exec rubocop

# Auto-fix safe offenses
docker compose run --rm web bundle exec rubocop -A

# Check specific directory
docker compose run --rm web bundle exec rubocop app/models
```

### 3. Using Make Commands
```bash
make rubocop        # Run RuboCop
make rubocop-fix    # Auto-fix offenses
```

## Common Commands

### Check All Files
```bash
docker compose run --rm web bundle exec rubocop
```

### Auto-Correct Offenses
```bash
# Safe corrections only
docker compose run --rm web bundle exec rubocop -a

# All corrections (including unsafe)
docker compose run --rm web bundle exec rubocop -A
```

### Check Specific Files
```bash
docker compose run --rm web bundle exec rubocop app/controllers/articles_controller.rb
docker compose run --rm web bundle exec rubocop spec/models/article_spec.rb
```

### Format Output
```bash
# Simple format
docker compose run --rm web bundle exec rubocop --format simple

# Progress format
docker compose run --rm web bundle exec rubocop --format progress

# JSON output
docker compose run --rm web bundle exec rubocop --format json
```

## Customizing Rules

You can override any Omakase rules in `.rubocop.yml`:

```yaml
# Omakase Ruby styling for Rails
inherit_gem:
  rubocop-rails-omakase: rubocop.yml

# Custom overrides
Layout/LineLength:
  Max: 150  # Increase from default 120

Style/Documentation:
  Enabled: false  # Disable documentation requirement
```

## Integration Tips

### Git Pre-commit Hook
Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
docker compose run --rm web bundle exec rubocop
```

### CI/CD Integration
Add to your CI pipeline:
```yaml
- name: Run RuboCop
  run: docker compose run --rm web bundle exec rubocop
```

### Editor Integration
- **VS Code**: Install "Ruby" extension (rubyide.vscode-ruby)
- **RubyMine**: RuboCop is built-in
- **Sublime**: Install "RuboCop" package

## Documentation

RuboCop configuration is documented in:
- `.rubocop.yml` - Custom overrides (inherits from Omakase)
- `README.md` - Usage instructions
- [Omakase GitHub](https://github.com/rails/rubocop-rails-omakase) - Base configuration

## Troubleshooting

### Gems Not Found
```bash
docker compose run --rm web bundle install
docker compose restart web
```

### Too Many Offenses
RuboCop with Omakase is designed to be strict but reasonable. If you have many offenses:

1. Auto-correct what you can:
   ```bash
   docker compose run --rm web bundle exec rubocop -A
   ```

2. For remaining issues, fix manually or disable specific cops in `.rubocop.yml`

### Understanding Omakase Decisions

The Omakase configuration makes opinionated choices based on:
- Rails core team preferences
- Community best practices
- Performance considerations
- Code readability

If you disagree with a rule, you can override it in `.rubocop.yml`

## Resources

- [RuboCop Documentation](https://docs.rubocop.org/)
- [rubocop-rails-omakase](https://github.com/rails/rubocop-rails-omakase)
- [Ruby Style Guide](https://rubystyle.guide/)
- [Rails Guides](https://guides.rubyonrails.org/)
