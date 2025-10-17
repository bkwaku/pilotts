class Api::Admin::ArticlesController < ApplicationController
  include Authentication
  before_action :require_authentication
  before_action :set_article, only: [ :update, :destroy, :autosave ]

  def create
    @article = current_user.articles.build(article_params)

    if @article.save
      render json: {
        status: "success",
        article: {
          id: @article.id,
          title: @article.title,
          body: @article.body.to_s,
          status: @article.status
        }
      }
    else
      render json: {
        status: "error",
        errors: @article.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def update
    if @article.update(article_params)
      render json: {
        status: "success",
        article: {
          id: @article.id,
          title: @article.title,
          body: @article.body.to_s,
          status: @article.status
        }
      }
    else
      render json: {
        status: "error",
        errors: @article.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def destroy
    @article.destroy
    render json: { status: "success", message: "Article deleted successfully." }
  end

  def autosave
    # Auto-save without validation for drafts
    @article.assign_attributes(article_params)
    @article.save(validate: false) if @article.draft?

    render json: {
      status: "success",
      message: "Auto-saved",
      last_saved: Time.current.strftime("%I:%M %p")
    }
  end

  private

  def set_article
    @article = current_user.articles.find(params[:id])
  end

  def article_params
    params.require(:article).permit(:title, :body, :status)
  end
end
