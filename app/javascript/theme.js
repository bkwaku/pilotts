// Theme Toggle Functionality
class ThemeManager {
  constructor() {
    this.init();
  }

  init() {
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);

    // Setup theme toggle buttons
    this.setupToggleButtons();
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    
    // Update icons
    const themeIcons = document.querySelectorAll('#theme-icon, #admin-theme-icon');
    themeIcons.forEach(icon => {
      if (theme === 'dark') {
        icon.className = 'fas fa-sun';
      } else {
        icon.className = 'fas fa-moon';
      }
    });

    // Update theme options in settings
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
      option.classList.remove('active');
      if (option.dataset.theme === theme) {
        option.classList.add('active');
      }
    });

    // Save to localStorage
    localStorage.setItem('theme', theme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  setupToggleButtons() {
    // Main theme toggle button
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => this.toggleTheme());
    }

    // Admin theme toggle button
    const adminToggleButton = document.getElementById('admin-theme-toggle');
    if (adminToggleButton) {
      adminToggleButton.addEventListener('click', () => this.toggleTheme());
    }

    // Theme option buttons in settings
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        this.setTheme(option.dataset.theme);
      });
    });
  }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
});