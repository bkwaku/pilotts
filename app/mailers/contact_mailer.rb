class ContactMailer < ApplicationMailer
  def new_message(name, email, message, to_email)
    @name = name
    @email = email
    @message = message

    mail(
      to: to_email,
      from: email,
      subject: "New Contact Form Message from #{name}"
    )
  end
end
