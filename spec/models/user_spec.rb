# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'associations' do
    it { should have_many(:sessions).dependent(:destroy) }
    it { should have_many(:articles).dependent(:destroy) }
  end

  describe 'password' do
    it { should have_secure_password }

    it 'requires a password' do
      user = build(:user, password: nil)
      expect(user).not_to be_valid
    end

    it 'requires password confirmation to match' do
      user = build(:user, password: 'password123', password_confirmation: 'different')
      expect(user).not_to be_valid
    end
  end

  describe 'email normalization' do
    it 'normalizes email to lowercase' do
      user = create(:user, email_address: 'TEST@EXAMPLE.COM')
      expect(user.email_address).to eq('test@example.com')
    end

    it 'strips whitespace from email' do
      user = create(:user, email_address: '  test@example.com  ')
      expect(user.email_address).to eq('test@example.com')
    end
  end

  describe 'creating a user' do
    it 'creates a valid user with required attributes' do
      user = build(:user)
      expect(user).to be_valid
    end

    it 'can have multiple articles' do
      user = create(:user)
      create_list(:article, 3, user: user)
      expect(user.articles.count).to eq(3)
    end
  end
end
