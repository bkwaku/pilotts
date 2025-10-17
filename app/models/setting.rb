# frozen_string_literal: true

class Setting < ApplicationRecord
  validates :contact_email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :blog_name, presence: true

  # Singleton pattern - only one setting record should exist
  def self.current
    first_or_create!(
      blog_name: "Personal Blog",
      contact_email: "your@email.com",
      twitter_url: "https://twitter.com/yourusername",
      linkedin_url: "https://linkedin.com/in/yourusername"
    )
  end
end
