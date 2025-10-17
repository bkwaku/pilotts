# frozen_string_literal: true

require 'rails_helper'

RSpec.describe TestMailer, type: :mailer do
  describe 'test_email' do
    let(:recipient) { 'test@example.com' }
    let(:mail) { TestMailer.test_email(recipient) }

    it 'renders the subject' do
      expect(mail.subject).to eq('Test Email from Pilotts')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([ recipient ])
    end

    it 'renders the sender email' do
      expect(mail.from).to eq([ 'from@example.com' ])
    end

    it 'includes the app name in the body' do
      expect(mail.body.encoded).to include('Pilotts')
    end

    it 'includes success message in the body' do
      expect(mail.body.encoded).to include('Test Email Successful!')
    end

    it 'includes current time in the body' do
      expect(mail.body.encoded).to match(/Email sent at:/)
    end
  end
end
