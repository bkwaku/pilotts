# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Create admin user
admin = User.find_or_create_by!(email_address: 'admin@example.com') do |user|
  user.password = 'password123'
end

# Create settings
Setting.find_or_create_by!(id: 1) do |s|
  s.contact_email = 'admin@example.com'
  s.twitter_url = 'https://twitter.com/yourusername'
  s.linkedin_url = 'https://linkedin.com/in/yourusername'
  s.bio = 'Welcome to my personal blog. I write about technology, programming, and life.'
end

# Create sample articles
if admin.articles.empty?
  admin.articles.create!(
    title: "Welcome to My Blog",
    body: "<div>This is my first blog post. I'm excited to share my thoughts and experiences with you.</div>",
    status: "published",
    published_at: 2.days.ago
  )

  admin.articles.create!(
    title: "About Ruby on Rails",
    body: "<div>Ruby on Rails is an amazing web framework that allows developers to build powerful web applications quickly and efficiently.</div>",
    status: "published",
    published_at: 1.day.ago
  )

  admin.articles.create!(
    title: "Draft Article",
    body: "<div>This is a draft article that is not yet published.</div>",
    status: "draft"
  )
end

puts "Seeds completed!"
puts "Admin user created with email: admin@example.com and password: password123"
