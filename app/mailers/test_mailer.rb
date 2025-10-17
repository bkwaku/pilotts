# frozen_string_literal: true

class TestMailer < ApplicationMailer
  def test_email(to_email)
    @app_name = "Pilotts"
    @test_time = Time.current

    mail(
      to: to_email,
      subject: "Test Email from #{@app_name}"
    )
  end
end
