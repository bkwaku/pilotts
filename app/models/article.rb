class Article < ApplicationRecord
  belongs_to :user

  validates :title, presence: true
  validates :html_body, presence: true
  validates :status, presence: true, inclusion: { in: %w[draft published archived] }

  scope :published, -> { where(status: "published") }
  scope :drafts, -> { where(status: "draft") }
  scope :archived, -> { where(status: "archived") }
  scope :not_archived, -> { where.not(status: "archived") }
  scope :by_year, -> { order("published_at DESC, created_at DESC") }

  before_validation :set_published_at, if: :will_save_change_to_status?

  def draft?
    status == "draft"
  end

  def published?
    status == "published"
  end

  def archived?
    status == "archived"
  end

  def excerpt(sentences = 2)
    Articles::ExcerptGeneration.new(self).perform(sentences)
  end

  def reading_time
    Articles::ReadingTimeCalculator.new(self).perform
  end

  # Method to get the display content
  def display_body
    html_body.to_s
  end

  private

  def set_published_at
    if status == "published" && published_at.blank?
      self.published_at = Time.current
    elsif status != "published"
      self.published_at = nil
    end
  end
end
