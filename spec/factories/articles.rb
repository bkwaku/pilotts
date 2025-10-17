# frozen_string_literal: true

FactoryBot.define do
  factory :article do
    association :user
    title { Faker::Lorem.sentence(word_count: 5) }
    html_body { "<p>#{Faker::Lorem.paragraph(sentence_count: 10)}</p>" }
    status { "draft" }

    trait :published do
      status { "published" }
      published_at { Time.current }
    end

    trait :archived do
      status { "archived" }
    end

    trait :with_long_content do
      html_body do
        paragraphs = Array.new(5) { "<p>#{Faker::Lorem.paragraph(sentence_count: 10)}</p>" }
        paragraphs.join("\n")
      end
    end
  end
end
