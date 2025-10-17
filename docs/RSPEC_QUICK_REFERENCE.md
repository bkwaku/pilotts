# RSpec Quick Reference

## Running Tests

```bash
# All tests
make rspec
docker compose run --rm web bundle exec rspec

# Specific directory
docker compose run --rm web bundle exec rspec spec/models

# Specific file
docker compose run --rm web bundle exec rspec spec/models/article_spec.rb

# Specific line
docker compose run --rm web bundle exec rspec spec/models/article_spec.rb:25

# With documentation format
make rspec-verbose

# Only failures
docker compose run --rm web bundle exec rspec --only-failures

# Run tagged tests
docker compose run --rm web bundle exec rspec --tag focus
```

## Basic Syntax

```ruby
describe Article do
  it "creates article" do
    article = create(:article)
    expect(article).to be_valid
  end
end
```

## Common Matchers

```ruby
# Equality
expect(article.title).to eq("Title")
expect(article.title).not_to eq("Other")

# Truthiness
expect(article.published?).to be true
expect(article.published?).to be_truthy
expect(article.published?).to be false
expect(article.published?).to be_falsey
expect(article.published?).to be_nil

# Comparison
expect(article.views).to be > 100
expect(article.views).to be >= 100
expect(article.views).to be < 1000
expect(article.views).to be_between(10, 100)

# Inclusion
expect([1, 2, 3]).to include(2)
expect("hello world").to include("world")
expect(article.title).to match(/Title/)

# Collections
expect(articles).to contain_exactly(article1, article2)
expect(articles).to match_array([article1, article2])
expect(articles).to be_empty
expect(articles.size).to eq(3)

# Type/Class
expect(article).to be_a(Article)
expect(article).to be_an_instance_of(Article)
expect(article).to respond_to(:title)

# Presence
expect(article.title).to be_present
expect(article.body).to be_blank

# Changes
expect { article.publish! }.to change { article.status }.from("draft").to("published")
expect { Article.create! }.to change(Article, :count).by(1)
expect { service.perform }.not_to change(Article, :count)
```

## Shoulda Matchers

```ruby
# Associations
it { should belong_to(:user) }
it { should have_many(:articles) }
it { should have_one(:profile) }
it { should have_and_belong_to_many(:tags) }

# Validations
it { should validate_presence_of(:title) }
it { should validate_uniqueness_of(:email) }
it { should validate_length_of(:title).is_at_least(5) }
it { should validate_length_of(:title).is_at_most(100) }
it { should validate_numericality_of(:age) }
it { should validate_inclusion_of(:status).in_array(%w[draft published]) }
it { should allow_value("test@example.com").for(:email) }

# Database
it { should have_db_column(:title).of_type(:string) }
it { should have_db_index(:email) }
```

## Factories

```ruby
# Create (save to database)
user = create(:user)
article = create(:article, title: "Custom")
articles = create_list(:article, 5)

# Build (don't save)
user = build(:user)
article = build(:article)

# Attributes hash
attrs = attributes_for(:user)

# Stubbed (no database)
user = build_stubbed(:user)

# With traits
article = create(:article, :published)
article = create(:article, :published, :with_long_content)

# Associations
article = create(:article, user: user)
user = create(:user) do |user|
  create_list(:article, 3, user: user)
end
```

## Contexts and Hooks

```ruby
describe Article do
  # Run once before all tests
  before(:all) do
    @user = create(:user)
  end

  # Run before each test
  before(:each) do
    @article = create(:article)
  end

  # After each test
  after(:each) do
    # cleanup
  end

  # Around each test
  around(:each) do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
  end

  context "when published" do
    let(:article) { create(:article, :published) }

    it "shows on homepage" do
      # test
    end
  end

  context "when draft" do
    let(:article) { create(:article) }

    it "does not show on homepage" do
      # test
    end
  end
end
```

## Let and Let!

```ruby
describe Article do
  # Lazy evaluation (created when first used)
  let(:user) { create(:user) }
  let(:article) { create(:article, user: user) }

  # Eager evaluation (created before each test)
  let!(:published) { create(:article, :published) }

  # Subject
  subject { article }

  it { is_expected.to be_valid }
  
  # Or with custom subject
  subject(:excerpt) { article.excerpt }

  it { is_expected.to include("First") }
end
```

## Mocking and Stubbing

```ruby
# Stub method
allow(article).to receive(:published?).and_return(true)

# Stub with arguments
allow(service).to receive(:perform).with("test").and_return("result")

# Expect method call
expect(mailer).to receive(:deliver_now)
service.perform

# Expect with arguments
expect(article).to receive(:update).with(title: "New")

# Stub any instance
allow_any_instance_of(Article).to receive(:excerpt).and_return("Test")

# Stub class method
allow(Article).to receive(:published).and_return([article])
```

## Authentication Helpers

```ruby
# In controller/request specs
before { sign_in(user) }

# Sign out
sign_out

# Check current user
expect(current_user).to eq(user)
```

## Custom Matchers

```ruby
# Define
RSpec::Matchers.define :be_published do
  match do |article|
    article.status == "published" && article.published_at.present?
  end
end

# Use
expect(article).to be_published
```

## Tags

```ruby
# Focus on specific tests
it "tests something", :focus do
  # only this runs with --tag focus
end

# Skip tests
it "tests something", :skip do
  # skipped
end

xit "is pending" do
  # pending
end

# Pending
it "needs implementation" do
  pending "not yet implemented"
end
```

## Shared Examples

```ruby
# Define
shared_examples "publishable" do
  it "can be published" do
    expect(subject).to respond_to(:publish!)
  end
end

# Use
describe Article do
  it_behaves_like "publishable"
end
```

## Coverage

```ruby
# In spec_helper.rb
require 'simplecov'
SimpleCov.start 'rails'

# View after running tests
open coverage/index.html
```

## Common Patterns

### Test Valid/Invalid

```ruby
it "creates valid article" do
  article = build(:article)
  expect(article).to be_valid
end

it "is invalid without title" do
  article = build(:article, title: nil)
  expect(article).not_to be_valid
  expect(article.errors[:title]).to include("can't be blank")
end
```

### Test Scopes

```ruby
describe ".published" do
  let!(:published) { create(:article, :published) }
  let!(:draft) { create(:article) }

  it "returns only published articles" do
    expect(Article.published).to contain_exactly(published)
  end
end
```

### Test Callbacks

```ruby
it "sets published_at on save" do
  article = create(:article, status: "draft")
  expect(article.published_at).to be_nil

  article.update(status: "published")
  expect(article.published_at).to be_present
end
```

### Test Service Objects

```ruby
describe "#perform" do
  let(:article) { create(:article) }
  subject { described_class.new(article) }

  it "returns excerpt" do
    result = subject.perform
    expect(result).to be_a(String)
  end
end
```

## Debugging

```ruby
# Print to console
it "debugs" do
  puts article.inspect
  pp article.attributes
end

# Pause execution
it "debugs" do
  binding.break  # requires debug gem
end

# Show failures
docker compose run --rm web bundle exec rspec --format documentation --fail-fast
```

## Tips

- Use `let` for test data (lazy)
- Use `let!` when you need it before the test runs
- Use `before` for setup that doesn't return a value
- Keep tests focused (one expectation per test ideally)
- Use descriptive test names
- Use contexts to group related tests
- Use traits in factories for variations
- Don't test framework code (Rails validations, etc.)
- Test edge cases and error conditions
