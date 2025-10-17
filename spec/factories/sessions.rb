FactoryBot.define do
  factory :session do
    association :user
    user_agent { "Mozilla/5.0 (Test Browser)" }
    ip_address { Faker::Internet.ip_v4_address }
  end
end
