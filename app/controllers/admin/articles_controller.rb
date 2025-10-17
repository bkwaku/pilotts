class Admin::ArticlesController < ApplicationController
  include Authentication
  before_action :require_authentication
  layout "admin"
  before_action :set_article, only: [ :show, :edit, :update, :destroy, :toggle_status, :archive, :autosave ]

  def index
    @filter = params[:filter] || "all"
    page = params[:page]&.to_i || 1
    limit = [ params[:limit]&.to_i || 100, 100 ].min # Max 100 articles

    @articles = case @filter
    when "published"
      current_user.articles.published
    when "drafts"
      current_user.articles.drafts
    when "archived"
      current_user.articles.archived
    else
      current_user.articles.all
    end

    @articles = @articles.order(created_at: :desc)
    @articles = @articles.where("title ILIKE ?", "%#{params[:search]}%") if params[:search].present?

    # Apply pagination
    @articles = @articles.limit(limit).offset((page - 1) * limit)

    @current_article = @articles.first || current_user.articles.build(title: "New Article", status: "draft")

    # Stats for cards (always get full counts, not just paginated)
    @stats = {
      published: current_user.articles.published.count,
      drafts: current_user.articles.drafts.count,
      archived: current_user.articles.archived.count
    }

    # Return JSON for React frontend
    if request.xhr? || request.format.json?
      render json: {
        articles: @articles.map { |article|
          {
            id: article.id,
            title: article.title,
            html_body: article.html_body,
            status: article.status,
            archived: article.archived?,
            created_at: article.created_at.strftime("%b %d, %Y"),
            updated_at: article.updated_at
          }
        },
        stats: @stats,
        filter: @filter,
        pagination: {
          page: page,
          limit: limit,
          total: current_user.articles.count
        }
      }
    end
  end

  def show
    # Return JSON for AJAX requests
    if request.xhr?
      render json: {
        id: @article.id,
        title: @article.title,
        body: @article.body.to_s,
        status: @article.status,
        archived: @article.archived?
      }
    end
  end

  def new
    @article = current_user.articles.create!(
      title: "Untitled",
      html_body: "<p><br></p>",
      status: "draft"
    )
    redirect_to edit_admin_article_path(@article)
  end

  def edit
    # @article is set by before_action
  end

  def create
    @article = current_user.articles.build(article_params)

    if @article.save
      if request.xhr? || request.format.json?
        render json: {
          status: "success",
          message: "Article created successfully.",
          article_path: edit_admin_article_path(@article),
          article: {
            id: @article.id,
            title: @article.title,
            html_body: @article.html_body,
            status: @article.status
          }
        }
      else
        redirect_to edit_admin_article_path(@article), notice: "Article created successfully."
      end
    else
      if request.xhr? || request.format.json?
        render json: { status: "error", errors: @article.errors.full_messages }, status: :unprocessable_entity
      else
        render :new, status: :unprocessable_entity
      end
    end
  end

  def update
    if @article.update(article_params)
      if request.xhr? || request.format.json?
        render json: {
          status: "success",
          message: "Article updated successfully.",
          new_status: @article.status,
          article: {
            id: @article.id,
            title: @article.title,
            html_body: @article.html_body,
            status: @article.status
          }
        }
      else
        redirect_to edit_admin_article_path(@article), notice: "Article updated successfully."
      end
    else
      if request.xhr? || request.format.json?
        render json: { status: "error", errors: @article.errors.full_messages }, status: :unprocessable_entity
      else
        render :edit, status: :unprocessable_entity
      end
    end
  end

  def destroy
    @article.destroy
    redirect_to admin_articles_path, notice: "Article deleted successfully."
  end

  def toggle_status
    new_status = @article.published? ? "draft" : "published"

    if @article.update(status: new_status)
      if request.xhr? || request.format.json?
        render json: {
          status: "success",
          message: "Article #{new_status == 'published' ? 'published' : 'saved as draft'} successfully.",
          article: {
            id: @article.id,
            title: @article.title,
            html_body: @article.html_body,
            status: @article.status,
            archived: @article.archived?,
            created_at: @article.created_at.strftime("%b %d, %Y"),
            updated_at: @article.updated_at
          }
        }
      else
        redirect_to admin_articles_path, notice: "Article #{new_status == 'published' ? 'published' : 'saved as draft'} successfully."
      end
    else
      if request.xhr? || request.format.json?
        render json: { status: "error", errors: @article.errors.full_messages }
      else
        redirect_to admin_articles_path, alert: "Error updating article."
      end
    end
  end

  def archive
    new_status = @article.archived? ? "draft" : "archived"

    if @article.update(status: new_status)
      if request.xhr? || request.format.json?
        render json: {
          status: "success",
          message: "Article #{new_status == 'archived' ? 'archived' : 'unarchived'} successfully.",
          article: {
            id: @article.id,
            title: @article.title,
            body: @article.body.to_s,
            status: @article.status,
            archived: @article.archived?,
            created_at: @article.created_at.strftime("%b %d, %Y"),
            updated_at: @article.updated_at
          }
        }
      else
        redirect_to admin_articles_path, notice: "Article #{new_status == 'archived' ? 'archived' : 'unarchived'} successfully."
      end
    else
      if request.xhr? || request.format.json?
        render json: { status: "error", errors: @article.errors.full_messages }
      else
        redirect_to admin_articles_path, alert: "Error updating article."
      end
    end
  end

  def search
    @articles = current_user.articles.where("title ILIKE ?", "%#{params[:q]}%")
                                   .order(created_at: :desc)
                                   .limit(20)

    render json: @articles.map { |article|
      {
        id: article.id,
        title: article.title,
        status: article.status,
        excerpt: article.excerpt(100),
        created_at: article.created_at.strftime("%b %d, %Y")
      }
    }
  end

  def autosave
    if @article.update(article_params)
      render json: {
        status: "success",
        message: "Article auto-saved",
        last_saved: Time.current.strftime("%I:%M %p")
      }
    else
      render json: { status: "error", errors: @article.errors.full_messages }
    end
  end

  def stats
    render json: {
      published: current_user.articles.published.count,
      drafts: current_user.articles.drafts.count,
      archived: current_user.articles.archived.count
    }
  end

  private

  def set_article
    @article = current_user.articles.find(params[:id])
  end

  def article_params
    params.require(:article).permit(:title, :html_body, :status)
  end
end
