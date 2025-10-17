# frozen_string_literal: true

class Admin::SettingsController < ApplicationController
  include Authentication
  before_action :require_authentication
  layout "admin"

  def show
    @setting = Setting.current
  end

  def update
    @setting = Setting.current

    if @setting.update(setting_params)
      redirect_to admin_settings_path, notice: "Settings updated successfully."
    else
      render :show, alert: "Error updating settings."
    end
  end

  private

  def setting_params
    params.require(:setting).permit(:blog_name, :twitter_url, :linkedin_url, :contact_email, :bio)
  end
end
