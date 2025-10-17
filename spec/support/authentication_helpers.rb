module AuthenticationHelpers
  def sign_in(user)
    session = user.sessions.create!(
      user_agent: 'Test Browser',
      ip_address: '127.0.0.1'
    )
    cookies.signed[:session_id] = session.id
    Current.session = session
  end

  def sign_out
    cookies.delete(:session_id)
    Current.session = nil
  end

  def current_user
    Current.session&.user
  end
end

RSpec.configure do |config|
  config.include AuthenticationHelpers, type: :controller
  config.include AuthenticationHelpers, type: :request
  config.include AuthenticationHelpers, type: :system
end
