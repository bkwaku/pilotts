# frozen_string_literal: true

class ArticlesController < ApplicationController
  def index
    # Get paginated articles first
    @articles = Article.published.includes(:user).by_year.page(params[:page]).per(10)

    # Group the current page articles by year for display
    @articles_by_year = @articles.group_by { |article| article.published_at&.year || article.created_at.year }
  end

  def show
    @article = Article.published.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    redirect_to articles_path, alert: "Article not found."
  end

  def search
    @articles = Article.published
                      .where("title ILIKE ?", "%#{params[:q]}%")
                      .order(created_at: :desc)
                      .limit(20)

    render json: @articles.map { |article|
      {
        id: article.id,
        title: article.title,
        excerpt: article.excerpt(100),
        created_at: article.created_at.strftime("%b %d, %Y")
      }
    }
  end
end
