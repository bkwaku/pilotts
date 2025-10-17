class AddBioToSettings < ActiveRecord::Migration[8.0]
  def change
    add_column :settings, :bio, :text
  end
end
