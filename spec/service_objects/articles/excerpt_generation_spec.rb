# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Articles::ExcerptGeneration do
  let(:user) { create(:user) }

  describe '#perform' do
    context 'with simple content' do
      let(:article) { create(:article, user: user, html_body: '<p>First sentence. Second sentence. Third sentence.</p>') }
      subject { described_class.new(article) }

      it 'returns first two sentences by default' do
        result = subject.perform
        expect(result).to eq('First sentence. Second sentence.')
      end

      it 'returns specified number of sentences' do
        result = subject.perform(1)
        expect(result).to eq('First sentence.')
      end

      it 'returns all sentences if fewer than requested' do
        result = subject.perform(10)
        expect(result).to eq('First sentence. Second sentence. Third sentence.')
      end
    end

    context 'with HTML tags' do
      let(:article) { create(:article, user: user, html_body: '<h1>Title</h1><p>First sentence. <strong>Second</strong> sentence.</p>') }
      subject { described_class.new(article) }

      it 'strips HTML tags' do
        result = subject.perform
        expect(result).not_to include('<h1>')
        expect(result).not_to include('<strong>')
        expect(result).to include('Title')
        expect(result).to include('First sentence.')
      end
    end

    context 'with different punctuation' do
      let(:article) { create(:article, user: user, html_body: '<p>Question? Exclamation! Period.</p>') }
      subject { described_class.new(article) }

      it 'recognizes sentences ending with different punctuation' do
        result = subject.perform(3)
        expect(result).to eq('Question? Exclamation! Period.')
      end
    end

    context 'with no proper sentences' do
      let(:article) { create(:article, user: user, html_body: '<p>Just some words without punctuation</p>') }
      subject { described_class.new(article) }

      it 'falls back to truncated text' do
        result = subject.perform
        expect(result).to eq('Just some words without punctuation')
      end
    end

    context 'with minimal content (whitespace only)' do
      let(:article) { create(:article, user: user, html_body: '<p>  </p>') }
      subject { described_class.new(article) }

      it 'returns empty string when no actual text' do
        result = subject.perform
        expect(result).to eq('')
      end
    end
  end
end
