require 'rails_helper'

RSpec.describe Admin::ArticlesController, type: :controller do
  let(:user) { create(:user) }
  let(:article) { create(:article, user: user) }

  before do
    sign_in(user)
  end

  describe 'GET #index' do
    let!(:published_article) { create(:article, :published, user: user) }
    let!(:draft_article) { create(:article, user: user, status: 'draft') }
    let!(:archived_article) { create(:article, :archived, user: user) }

    it 'returns a successful response' do
      get :index
      expect(response).to be_successful
    end

    it 'assigns all articles by default' do
      get :index
      expect(assigns(:articles)).to match_array([published_article, draft_article, archived_article])
    end

    context 'with published filter' do
      it 'returns only published articles' do
        get :index, params: { filter: 'published' }
        expect(assigns(:articles)).to contain_exactly(published_article)
      end
    end

    context 'with drafts filter' do
      it 'returns only draft articles' do
        get :index, params: { filter: 'drafts' }
        expect(assigns(:articles)).to contain_exactly(draft_article)
      end
    end

    context 'with archived filter' do
      it 'returns only archived articles' do
        get :index, params: { filter: 'archived' }
        expect(assigns(:articles)).to contain_exactly(archived_article)
      end
    end

    context 'with search query' do
      let!(:matching_article) { create(:article, user: user, title: 'Specific Title') }

      it 'filters articles by search query' do
        get :index, params: { search: 'Specific' }
        expect(assigns(:articles)).to contain_exactly(matching_article)
      end
    end
  end

  describe 'GET #edit' do
    it 'returns a successful response' do
      get :edit, params: { id: article.id }
      expect(response).to be_successful
    end

    it 'assigns the requested article' do
      get :edit, params: { id: article.id }
      expect(assigns(:article)).to eq(article)
    end
  end

  describe 'GET #new' do
    it 'creates a new article and redirects to edit' do
      expect {
        get :new
      }.to change(Article, :count).by(1)
      
      expect(response).to redirect_to(edit_admin_article_path(Article.last))
    end

    it 'creates article with default values' do
      get :new
      article = Article.last
      expect(article.title).to eq('Untitled')
      expect(article.status).to eq('draft')
    end
  end

  describe 'PATCH #update' do
    context 'with valid parameters' do
      let(:new_attributes) { { title: 'Updated Title', html_body: '<p>Updated body</p>' } }

      it 'updates the article' do
        patch :update, params: { id: article.id, article: new_attributes }
        article.reload
        expect(article.title).to eq('Updated Title')
        expect(article.html_body).to eq('<p>Updated body</p>')
      end

      it 'responds with success for AJAX requests' do
        patch :update, params: { id: article.id, article: new_attributes }, xhr: true
        expect(response).to be_successful
        expect(JSON.parse(response.body)['status']).to eq('success')
      end
    end

    context 'with invalid parameters' do
      let(:invalid_attributes) { { title: '', html_body: '' } }

      it 'does not update the article' do
        original_title = article.title
        patch :update, params: { id: article.id, article: invalid_attributes }
        article.reload
        expect(article.title).to eq(original_title)
      end
    end
  end

  describe 'DELETE #destroy' do
    it 'destroys the article' do
      article_to_delete = create(:article, user: user)
      expect {
        delete :destroy, params: { id: article_to_delete.id }
      }.to change(Article, :count).by(-1)
    end

    it 'redirects to articles index' do
      delete :destroy, params: { id: article.id }
      expect(response).to redirect_to(admin_articles_path)
    end
  end

  describe 'PATCH #toggle_status' do
    context 'when article is draft' do
      let(:draft_article) { create(:article, user: user, status: 'draft') }

      it 'changes status to published' do
        patch :toggle_status, params: { id: draft_article.id }
        draft_article.reload
        expect(draft_article.status).to eq('published')
      end

      it 'sets published_at' do
        patch :toggle_status, params: { id: draft_article.id }
        draft_article.reload
        expect(draft_article.published_at).to be_present
      end
    end

    context 'when article is published' do
      let(:published_article) { create(:article, :published, user: user) }

      it 'changes status to draft' do
        patch :toggle_status, params: { id: published_article.id }
        published_article.reload
        expect(published_article.status).to eq('draft')
      end

      it 'clears published_at' do
        patch :toggle_status, params: { id: published_article.id }
        published_article.reload
        expect(published_article.published_at).to be_nil
      end
    end
  end

  describe 'PATCH #archive' do
    context 'when article is not archived' do
      it 'archives the article' do
        patch :archive, params: { id: article.id }
        article.reload
        expect(article.status).to eq('archived')
      end
    end

    context 'when article is archived' do
      let(:archived_article) { create(:article, :archived, user: user) }

      it 'unarchives the article' do
        patch :archive, params: { id: archived_article.id }
        archived_article.reload
        expect(archived_article.status).to eq('draft')
      end
    end
  end

  describe 'PATCH #autosave' do
    let(:new_content) { { title: 'Autosaved', html_body: '<p>Autosaved content</p>' } }

    it 'updates the article' do
      patch :autosave, params: { id: article.id, article: new_content }
      article.reload
      expect(article.title).to eq('Autosaved')
    end

    it 'returns success response' do
      patch :autosave, params: { id: article.id, article: new_content }
      expect(response).to be_successful
      expect(JSON.parse(response.body)['status']).to eq('success')
    end
  end

  describe 'authentication' do
    context 'when not signed in' do
      before { sign_out }

      it 'redirects to login page' do
        get :index
        expect(response).to redirect_to(new_session_path)
      end
    end
  end
end
