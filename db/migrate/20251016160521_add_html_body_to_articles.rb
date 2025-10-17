class AddHtmlBodyToArticles < ActiveRecord::Migration[8.0]
  def change
    add_column :articles, :html_body, :text
  end
end
