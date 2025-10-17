class Articles::ExcerptGeneration
  DEFAULT_SENTENCE_COUNT = 2
  FALLBACK_LENGTH = 150

  def initialize(article)
    @article = article
  end

  def perform(sentence_count = DEFAULT_SENTENCE_COUNT)
    sentences_array = extract_sentences

    if has_enough_sentences?(sentences_array, sentence_count)
      first_sentences(sentences_array, sentence_count)
    elsif sentences_array.any?
      all_sentences(sentences_array)
    else
      fallback_excerpt
    end
  end

  private

  attr_reader :article

  def extract_sentences
    split_into_sentences(plain_text).map(&:strip)
  end

  def plain_text
    ActionController::Base.helpers.strip_tags(article.display_body).squish
  end

  def split_into_sentences(text)
    text.scan(/[^.!?]+[.!?]+/)
  end

  def has_enough_sentences?(sentences_array, count)
    sentences_array.length >= count
  end

  def first_sentences(sentences_array, count)
    sentences_array.first(count).join(" ")
  end

  def all_sentences(sentences_array)
    sentences_array.join(" ")
  end

  def fallback_excerpt
    plain_text.truncate(FALLBACK_LENGTH)
  end
end
