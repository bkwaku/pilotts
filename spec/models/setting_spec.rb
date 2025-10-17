require 'rails_helper'

RSpec.describe Setting, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:contact_email) }
    it { should validate_presence_of(:blog_name) }
    
    it 'validates email format' do
      setting = build(:setting, contact_email: 'invalid-email')
      expect(setting).not_to be_valid
    end

    it 'accepts valid email format' do
      setting = build(:setting, contact_email: 'valid@example.com')
      expect(setting).to be_valid
    end
  end

  describe '.current' do
    context 'when no setting exists' do
      it 'creates a new setting with default values' do
        expect(Setting.count).to eq(0)
        setting = Setting.current
        expect(Setting.count).to eq(1)
        expect(setting.blog_name).to eq("Personal Blog")
      end
    end

    context 'when setting already exists' do
      let!(:existing_setting) { create(:setting) }

      it 'returns the existing setting' do
        setting = Setting.current
        expect(setting).to eq(existing_setting)
        expect(Setting.count).to eq(1)
      end
    end
  end
end
