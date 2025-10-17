# RSpec Testing Guide

This project uses RSpec for testing instead of Minitest.

## Setup

The RSpec test suite has been configured with:
- **RSpec Rails** - Rails-specific RSpec helpers
- **FactoryBot** - Test data factories
- **Faker** - Generate fake data
- **Shoulda Matchers** - One-liner matchers for common Rails validations
- **DatabaseCleaner** - Ensure clean database state between tests
- **SimpleCov** - Code coverage reporting

## Installation

Install test gems:

```bash
# Using Docker
docker compose run --rm web bundle install

# Or with Make
make bundle-install
```

## Running Tests

### Run all tests
```bash
# Using Docker
docker compose run --rm web bundle exec rspec

# Or with Make (if added)
make test
```

### Run specific test files
```bash
# Run model tests
docker compose run --rm web bundle exec rspec spec/models

# Run a specific file
docker compose run --rm web bundle exec rspec spec/models/article_spec.rb

# Run a specific test
docker compose run --rm web bundle exec rspec spec/models/article_spec.rb:10
```

### Run with different formats
```bash
# Documentation format (detailed)
docker compose run --rm web bundle exec rspec --format documentation

# Progress format (dots)
docker compose run --rm web bundle exec rspec --format progress
```

### Run only failed tests
```bash
docker compose run --rm web bundle exec rspec --only-failures
```

## Test Structure

```
spec/
├── controllers/          # Controller tests
│   ├── admin/
│   │   └── articles_controller_spec.rb
│   ├── articles_controller_spec.rb
│   └── home_controller_spec.rb
├── factories/            # FactoryBot factories
│   ├── articles.rb
│   ├── sessions.rb
│   ├── settings.rb
│   └── users.rb
├── mailers/             # Mailer tests
│   └── test_mailer_spec.rb
├── models/              # Model tests
│   ├── article_spec.rb
│   ├── session_spec.rb
│   ├── setting_spec.rb
│   └── user_spec.rb
├── service_objects/     # Service object tests
│   └── articles/
│       ├── excerpt_generation_spec.rb
│       └── reading_time_calculator_spec.rb
├── support/             # Helper files
│   └── authentication_helpers.rb
├── rails_helper.rb      # Rails-specific configuration
└── spec_helper.rb       # RSpec configuration
```

## Writing Tests

### Model Tests

```ruby
require 'rails_helper'

RSpec.describe Article, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:title) }
  end

  describe '#published?' do
    it 'returns true for published articles' do
      article = create(:article, :published)
      expect(article.published?).to be true
    end
  end
end
```

### Controller Tests

```ruby
require 'rails_helper'

RSpec.describe ArticlesController, type: :controller do
  let(:user) { create(:user) }

  before { sign_in(user) }

  describe 'GET #index' do
    it 'returns successful response' do
      get :index
      expect(response).to be_successful
    end
  end
end
```

### Service Object Tests

```ruby
require 'rails_helper'

RSpec.describe Articles::ExcerptGeneration do
  let(:article) { create(:article, html_body: '<p>Test.</p>') }
  subject { described_class.new(article) }

  it 'returns excerpt' do
    expect(subject.perform).to eq('Test.')
  end
end
```

## Using Factories

```ruby
# Create a user
user = create(:user)

# Build without saving
user = build(:user)

# Create with attributes
user = create(:user, email_address: 'custom@example.com')

# Create with traits
article = create(:article, :published)
article = create(:article, :with_long_content)

# Create lists
articles = create_list(:article, 5, user: user)
```

## Code Coverage

SimpleCov generates a coverage report after running tests.

View the report:
```bash
open coverage/index.html
```

Coverage reports are grouped by:
- Controllers
- Models
- Helpers
- Mailers
- Services

## Best Practices

1. **Use descriptive test names**
   ```ruby
   it 'creates article with valid attributes' do
   ```

2. **Follow Arrange-Act-Assert pattern**
   ```ruby
   it 'updates article' do
     # Arrange
     article = create(:article)
     
     # Act
     article.update(title: 'New Title')
     
     # Assert
     expect(article.title).to eq('New Title')
   end
   ```

3. **Use contexts for different scenarios**
   ```ruby
   describe '#publish' do
     context 'when article is draft' do
       it 'changes status to published'
     end
     
     context 'when article is already published' do
       it 'does not change status'
     end
   end
   ```

4. **Use let for test data**
   ```ruby
   let(:user) { create(:user) }
   let!(:article) { create(:article, user: user) } # ! creates immediately
   ```

5. **Test edge cases**
   - Empty values
   - Nil values
   - Invalid data
   - Boundary conditions

## Authentication in Tests

Use the authentication helper:

```ruby
# In controller/request specs
before { sign_in(user) }

# Sign out
sign_out

# Check current user
expect(current_user).to eq(user)
```

## Debugging Tests

```ruby
# Print debug information
it 'debugs article' do
  article = create(:article)
  puts article.inspect
  binding.break # Add breakpoint (requires debug gem)
end
```

## Continuous Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: docker compose run --rm web bundle exec rspec
```

## Migrating from Minitest

The `test/` directory can be safely removed:

```bash
rm -rf test/
```

All tests have been rewritten in RSpec format in the `spec/` directory.

## Additional Resources

- [RSpec Documentation](https://rspec.info/)
- [FactoryBot Guide](https://github.com/thoughtbot/factory_bot/blob/master/GETTING_STARTED.md)
- [Shoulda Matchers](https://github.com/thoughtbot/shoulda-matchers)
- [Better Specs](https://www.betterspecs.org/)
