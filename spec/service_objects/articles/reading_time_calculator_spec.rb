# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Articles::ReadingTimeCalculator do
  let(:user) { create(:user) }

  describe '#perform' do
    context 'with short content (< 200 words)' do
      let(:article) { create(:article, user: user, html_body: '<p>Short content.</p>') }
      subject { described_class.new(article) }

      it 'returns "1 min read"' do
        expect(subject.perform).to eq('1 min read')
      end
    end

    context 'with medium content (~400 words)' do
      let(:article) do
        words = Array.new(400) { 'word' }.join(' ')
        create(:article, user: user, html_body: "<p>#{words}</p>")
      end
      subject { described_class.new(article) }

      it 'returns correct reading time' do
        expect(subject.perform).to eq('2 min read')
      end
    end

    context 'with long content (~1000 words)' do
      let(:article) do
        words = Array.new(1000) { 'word' }.join(' ')
        create(:article, user: user, html_body: "<p>#{words}</p>")
      end
      subject { described_class.new(article) }

      it 'returns correct reading time' do
        expect(subject.perform).to eq('5 min read')
      end
    end

    context 'with HTML tags' do
      let(:article) do
        create(:article, user: user, html_body: '<h1>Title</h1><p>Content with <strong>HTML</strong> tags.</p>')
      end
      subject { described_class.new(article) }

      it 'strips HTML and calculates based on text' do
        expect(subject.perform).to match(/\d+ min read/)
      end
    end

    context 'with minimal content (just whitespace/tags)' do
      let(:article) { create(:article, user: user, html_body: '<p>  </p>') }
      subject { described_class.new(article) }

      it 'returns "1 min read" for zero words' do
        expect(subject.perform).to eq('1 min read')
      end
    end
  end
end
