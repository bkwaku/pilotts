class AddBlogNameToSettings < ActiveRecord::Migration[8.0]
  def change
    add_column :settings, :blog_name, :string
  end
end
