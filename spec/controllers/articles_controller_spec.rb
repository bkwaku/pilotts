# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ArticlesController, type: :controller do
  let(:user) { create(:user) }
  let!(:published_article) { create(:article, :published, user: user) }
  let!(:draft_article) { create(:article, user: user, status: 'draft') }

  describe 'GET #index' do
    it 'returns a successful response' do
      get :index
      expect(response).to be_successful
    end

    it 'only shows published articles' do
      get :index
      expect(assigns(:articles_by_year).values.flatten).to contain_exactly(published_article)
      expect(assigns(:articles_by_year).values.flatten).not_to include(draft_article)
    end

    it 'groups articles by year' do
      get :index
      year = published_article.published_at.year
      expect(assigns(:articles_by_year)).to have_key(year)
    end
  end

  describe 'GET #show' do
    it 'returns a successful response for published article' do
      get :show, params: { id: published_article.id }
      expect(response).to be_successful
    end

    it 'assigns the requested article' do
      get :show, params: { id: published_article.id }
      expect(assigns(:article)).to eq(published_article)
    end
  end

  describe 'GET #search' do
    let!(:searchable_article) { create(:article, :published, user: user, title: 'Searchable Title') }

    it 'returns matching articles as JSON' do
      get :search, params: { q: 'Searchable' }, format: :json
      expect(response).to be_successful

      json_response = JSON.parse(response.body)
      expect(json_response.length).to eq(1)
      expect(json_response.first['title']).to eq('Searchable Title')
    end

    it 'returns empty array for no matches' do
      get :search, params: { q: 'NonexistentTitle' }, format: :json
      expect(response).to be_successful

      json_response = JSON.parse(response.body)
      expect(json_response).to be_empty
    end

    it 'limits results to 20 articles' do
      create_list(:article, 25, :published, user: user, title: 'Test Article')

      get :search, params: { q: 'Test' }, format: :json
      json_response = JSON.parse(response.body)
      expect(json_response.length).to eq(20)
    end
  end
end
