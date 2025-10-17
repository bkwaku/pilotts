require 'rails_helper'

RSpec.describe Session, type: :model do
  describe 'associations' do
    it { should belong_to(:user) }
  end

  describe 'creating a session' do
    let(:user) { create(:user) }

    it 'creates a valid session for a user' do
      session = create(:session, user: user)
      expect(session).to be_valid
      expect(session.user).to eq(user)
    end

    it 'stores user agent information' do
      session = create(:session, user: user, user_agent: 'Test Browser')
      expect(session.user_agent).to eq('Test Browser')
    end

    it 'stores ip address information' do
      session = create(:session, user: user, ip_address: '192.168.1.1')
      expect(session.ip_address).to eq('192.168.1.1')
    end
  end
end
