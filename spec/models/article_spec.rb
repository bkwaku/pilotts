require 'rails_helper'

RSpec.describe Article, type: :model do
  describe 'associations' do
    it { should belong_to(:user) }
  end

  describe 'validations' do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:html_body) }
    it { should validate_presence_of(:status) }
    it { should validate_inclusion_of(:status).in_array(%w[draft published archived]) }
  end

  describe 'scopes' do
    let(:user) { create(:user) }
    let!(:published_article) { create(:article, :published, user: user) }
    let!(:draft_article) { create(:article, user: user, status: 'draft') }
    let!(:archived_article) { create(:article, :archived, user: user) }

    describe '.published' do
      it 'returns only published articles' do
        expect(Article.published).to contain_exactly(published_article)
      end
    end

    describe '.drafts' do
      it 'returns only draft articles' do
        expect(Article.drafts).to contain_exactly(draft_article)
      end
    end

    describe '.archived' do
      it 'returns only archived articles' do
        expect(Article.archived).to contain_exactly(archived_article)
      end
    end

    describe '.not_archived' do
      it 'returns articles that are not archived' do
        expect(Article.not_archived).to contain_exactly(published_article, draft_article)
      end
    end
  end

  describe 'status methods' do
    let(:article) { create(:article) }

    describe '#draft?' do
      it 'returns true for draft articles' do
        article.status = 'draft'
        expect(article.draft?).to be true
      end

      it 'returns false for non-draft articles' do
        article.status = 'published'
        expect(article.draft?).to be false
      end
    end

    describe '#published?' do
      it 'returns true for published articles' do
        article.status = 'published'
        expect(article.published?).to be true
      end

      it 'returns false for non-published articles' do
        article.status = 'draft'
        expect(article.published?).to be false
      end
    end

    describe '#archived?' do
      it 'returns true for archived articles' do
        article.status = 'archived'
        expect(article.archived?).to be true
      end

      it 'returns false for non-archived articles' do
        article.status = 'draft'
        expect(article.archived?).to be false
      end
    end
  end

  describe '#set_published_at' do
    let(:article) { create(:article, status: 'draft') }

    it 'sets published_at when status changes to published' do
      expect(article.published_at).to be_nil
      article.update(status: 'published')
      expect(article.published_at).to be_present
    end

    it 'does not change published_at if already published' do
      article.update(status: 'published')
      original_time = article.published_at
      
      article.update(title: 'New Title')
      expect(article.published_at).to eq(original_time)
    end

    it 'clears published_at when status changes from published' do
      article.update(status: 'published')
      expect(article.published_at).to be_present
      
      article.update(status: 'draft')
      expect(article.published_at).to be_nil
    end
  end

  describe '#excerpt' do
    let(:article) { create(:article, html_body: '<p>First sentence. Second sentence. Third sentence.</p>') }

    it 'returns first two sentences by default' do
      expect(article.excerpt).to include('First sentence.')
      expect(article.excerpt).to include('Second sentence.')
    end

    it 'accepts custom sentence count' do
      expect(article.excerpt(1)).to eq('First sentence.')
    end
  end

  describe '#reading_time' do
    let(:article) { create(:article, :with_long_content) }

    it 'returns reading time estimate' do
      expect(article.reading_time).to match(/\d+ min read/)
    end
  end

  describe '#display_body' do
    let(:article) { create(:article, html_body: '<p>Test content</p>') }

    it 'returns html_body as string' do
      expect(article.display_body).to eq('<p>Test content</p>')
    end

    it 'returns empty string when html_body is nil' do
      article.html_body = nil
      expect(article.display_body).to eq('')
    end
  end
end
