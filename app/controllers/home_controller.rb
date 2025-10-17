# frozen_string_literal: true

class HomeController < ApplicationController
  def index
    # Get paginated articles first
    @articles = Article.published.includes(:user).by_year.page(params[:page]).per(10)

    # Group the current page articles by year for display
    @articles_by_year = @articles.group_by { |article| article.published_at&.year || article.created_at.year }
  end

  def about
    @setting = Setting.current
  end

  def contact
    @setting = Setting.current

    if request.post?
      name = params[:name]
      email = params[:email]
      message = params[:message]

      if name.present? && email.present? && message.present?
        ContactMailer.new_message(name, email, message, @setting.contact_email).deliver_now
        flash[:notice] = "Thank you for your message! I'll get back to you soon."
        redirect_to contact_path
      else
        flash.now[:alert] = "Please fill in all fields."
      end
    end
  end
end
