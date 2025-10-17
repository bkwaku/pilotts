class CreateSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :settings do |t|
      t.string :twitter_url
      t.string :linkedin_url
      t.string :contact_email

      t.timestamps
    end
  end
end
