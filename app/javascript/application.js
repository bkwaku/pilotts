// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails

// Import theme functionality for all pages
import "theme"

// Import admin functionality only for admin pages
if (document.querySelector('.admin-body')) {
  import("admin");
}
