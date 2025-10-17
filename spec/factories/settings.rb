FactoryBot.define do
  factory :setting do
    blog_name { "Test Blog" }
    contact_email { Faker::Internet.email }
    twitter_url { "https://twitter.com/testuser" }
    linkedin_url { "https://linkedin.com/in/testuser" }
  end
end
