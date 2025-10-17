# frozen_string_literal: true

require 'rails_helper'

RSpec.describe HomeController, type: :controller do
  let(:user) { create(:user) }

  describe 'GET #index' do
    let!(:published_article) { create(:article, :published, user: user) }
    let!(:draft_article) { create(:article, user: user, status: 'draft') }

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

  describe 'GET #about' do
    it 'returns a successful response' do
      get :about
      expect(response).to be_successful
    end
  end

  describe 'GET #contact' do
    before { create(:setting) }

    it 'returns a successful response' do
      get :contact
      expect(response).to be_successful
    end

    it 'assigns the current setting' do
      get :contact
      expect(assigns(:setting)).to be_present
    end
  end

  describe 'POST #contact' do
    let(:contact_params) do
      {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message'
      }
    end

    before { create(:setting) }

    context 'with valid parameters' do
      it 'sets flash notice' do
        post :contact, params: contact_params
        expect(flash[:notice]).to be_present
      end

      it 'redirects to contact page' do
        post :contact, params: contact_params
        expect(response).to redirect_to(contact_path)
      end
    end

    context 'with missing parameters' do
      it 'sets flash alert when name is missing' do
        post :contact, params: { email: 'test@example.com', message: 'Test' }
        expect(flash[:alert]).to be_present
      end

      it 'does not redirect when parameters are missing' do
        post :contact, params: { email: 'test@example.com', message: 'Test' }
        expect(response).to be_successful
      end
    end
  end
end
