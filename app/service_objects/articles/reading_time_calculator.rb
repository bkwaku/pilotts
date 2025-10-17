class Articles::ReadingTimeCalculator
  WORDS_PER_MINUTE = 200

  def initialize(article)
    @article = article
  end

  def perform
    return "1 min read" if word_count.zero?

    minutes = calculate_minutes
    format_reading_time(minutes)
  end

  private

  attr_reader :article

  def word_count
    @word_count ||= plain_text.split(/\s+/).size
  end

  def plain_text
    ActionController::Base.helpers.strip_tags(article.display_body).squish
  end

  def calculate_minutes
    (word_count.to_f / WORDS_PER_MINUTE).ceil
  end

  def format_reading_time(minutes)
    if minutes < 1
      "< 1 min read"
    elsif minutes == 1
      "1 min read"
    else
      "#{minutes} min read"
    end
  end
end
