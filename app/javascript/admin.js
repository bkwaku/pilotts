// Admin Dashboard Functionality
class AdminDashboard {
  constructor() {
    this.currentArticleId = null;
    this.autosaveTimer = null;
    this.searchTimer = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupAutosave();
    this.loadInitialArticle();
  }

  setupEventListeners() {
    // Article list item clicks
    document.addEventListener('click', (e) => {
      const articleItem = e.target.closest('.article-item');
      if (articleItem) {
        e.preventDefault();
        this.selectArticle(articleItem);
      }
    });

    // Stats card filters (only for actual filterable cards)
    document.addEventListener('click', (e) => {
      const statCard = e.target.closest('.stat-card[data-filter]');
      if (statCard) {
        e.preventDefault();
        this.filterArticles(statCard.dataset.filter);
      }
    });

    // Status toggle buttons
    const draftBtn = document.getElementById('draft-btn');
    const publishBtn = document.getElementById('publish-btn');
    const archiveBtn = document.getElementById('archive-btn');

    if (draftBtn) {
      draftBtn.addEventListener('click', () => {
        if (!draftBtn.classList.contains('active')) {
          this.updateStatus('draft');
        }
      });
    }

    if (publishBtn) {
      publishBtn.addEventListener('click', () => {
        if (!publishBtn.classList.contains('active') && !publishBtn.disabled) {
          this.updateStatus('published');
        }
      });
    }

    if (archiveBtn) {
      archiveBtn.addEventListener('click', () => this.toggleArchive());
    }

    // New article button
    const newArticleBtn = document.getElementById('new-article-btn');
    if (newArticleBtn) {
      newArticleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.createNewArticle();
      });
    }

    // Search functionality
    const searchInput = document.getElementById('article-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => {
          this.searchArticles(e.target.value);
        }, 300);
      });
    }

    // Form submission
    const articleForm = document.getElementById('article-form');
    if (articleForm) {
      articleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveArticle();
      });
    }
  }

  setupAutosave() {
    const titleInput = document.getElementById('article-title');
    const bodyEditor = document.querySelector('#article-body');

    if (titleInput) {
      titleInput.addEventListener('input', () => {
        this.scheduleAutosave();
      });
    }

    if (bodyEditor) {
      // Listen for Trix editor changes
      bodyEditor.addEventListener('trix-change', () => {
        this.scheduleAutosave();
      });
      
      // Also listen for direct changes to the editor
      const trixEditor = bodyEditor.querySelector('trix-editor') || bodyEditor;
      if (trixEditor) {
        trixEditor.addEventListener('trix-change', () => {
          this.scheduleAutosave();
        });
      }
    }
  }

  scheduleAutosave() {
    clearTimeout(this.autosaveTimer);
    this.updateSaveStatus('saving');
    
    this.autosaveTimer = setTimeout(() => {
      this.autosave();
    }, 2000);
  }

  async autosave() {
    if (!this.currentArticleId) return;

    const formData = this.getFormData();
    
    try {
      const response = await fetch(`/api/admin/articles/${this.currentArticleId}/autosave`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        },
        body: JSON.stringify({ article: formData })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        this.updateSaveStatus('saved', data.last_saved);
      } else {
        this.updateSaveStatus('error');
      }
    } catch (error) {
      console.error('Autosave failed:', error);
      this.updateSaveStatus('error');
    }
  }

  async saveArticle() {
    const formData = this.getFormData();
    const url = this.currentArticleId ? 
      `/admin/articles/${this.currentArticleId}` : 
      '/admin/articles';
    const method = this.currentArticleId ? 'PATCH' : 'POST';

    try {
      this.updateSaveStatus('saving');
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        },
        body: JSON.stringify({ article: formData })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        this.updateSaveStatus('saved');
        this.refreshArticlesList();
        
        if (data.article && !this.currentArticleId) {
          this.currentArticleId = data.article.id;
        }
      } else {
        this.updateSaveStatus('error');
        console.error('Save failed:', data.errors);
      }
    } catch (error) {
      console.error('Save failed:', error);
      this.updateSaveStatus('error');
    }
  }

  getFormData() {
    const titleInput = document.getElementById('article-title');
    const bodyInput = document.querySelector('input[name="article[body]"]'); // ActionText hidden input
    const trixEditor = document.querySelector('trix-editor');
    
    const title = titleInput ? titleInput.value : '';
    let body = '';
    
    // Try multiple ways to get the body content
    if (trixEditor && trixEditor.editor) {
      body = trixEditor.innerHTML || trixEditor.editor.getDocument().toString();
    } else if (bodyInput) {
      body = bodyInput.value;
    } else {
      const bodyEditor = document.querySelector('#article-body');
      body = bodyEditor ? bodyEditor.value : '';
    }
    
    return { title, body };
  }

  updateSaveStatus(status, lastSaved = null) {
    const indicator = document.getElementById('save-indicator');
    const text = document.getElementById('save-text');
    
    if (!indicator || !text) return;

    switch (status) {
      case 'saving':
        indicator.className = 'fas fa-circle';
        indicator.style.color = '#ffc107';
        text.textContent = 'Saving...';
        break;
      case 'saved':
        indicator.className = 'fas fa-check-circle';
        indicator.style.color = '#28a745';
        text.textContent = lastSaved ? `Saved at ${lastSaved}` : 'Saved';
        break;
      case 'error':
        indicator.className = 'fas fa-exclamation-circle';
        indicator.style.color = '#dc3545';
        text.textContent = 'Save failed';
        break;
      default:
        indicator.className = 'fas fa-circle';
        indicator.style.color = '#6c757d';
        text.textContent = 'Auto-save enabled';
    }
  }

  async selectArticle(articleElement) {
    if (!articleElement) return;
    
    // Remove active class from all articles
    document.querySelectorAll('.article-item').forEach(item => {
      item.classList.remove('active');
    });

    // Add active class to selected article
    articleElement.classList.add('active');

    // Get article ID and load it
    const articleId = articleElement.dataset.articleId;
    if (articleId) {
      await this.loadArticle(articleId);
    }
  }

  async loadArticle(articleId) {
    try {
      const response = await fetch(`/admin/articles/${articleId}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        }
      });

      const article = await response.json();
      
      if (article) {
        this.currentArticleId = article.id;
        this.populateEditor(article);
        this.updateStatusButtons(article.status, article.archived);
      }
    } catch (error) {
      console.error('Failed to load article:', error);
    }
  }

  populateEditor(article) {
    const titleInput = document.getElementById('article-title');
    const bodyEditor = document.querySelector('#article-body');

    if (titleInput) {
      titleInput.value = article.title || '';
    }

    if (bodyEditor) {
      const content = article.body || '';
      
      // Find the actual Trix editor element
      const trixEditor = document.querySelector('trix-editor');
      
      if (trixEditor && trixEditor.editor) {
        // Editor is ready, load the content
        trixEditor.editor.loadHTML(content);
      } else {
        // Editor not ready, wait for it
        const waitForEditor = () => {
          const editor = document.querySelector('trix-editor');
          if (editor && editor.editor) {
            editor.editor.loadHTML(content);
          } else {
            setTimeout(waitForEditor, 100);
          }
        };
        waitForEditor();
      }
    }

    // Update editor title
    const editorTitle = document.querySelector('.editor-title');
    if (editorTitle) {
      editorTitle.textContent = article.title ? 
        `Editing: ${article.title.substring(0, 30)}${article.title.length > 30 ? '...' : ''}` : 
        'New Article';
    }
  }

  updateStatusButtons(status, archived) {
    const draftBtn = document.getElementById('draft-btn');
    const publishBtn = document.getElementById('publish-btn');
    const archiveBtn = document.getElementById('archive-btn');

    // Reset all buttons
    [draftBtn, publishBtn, archiveBtn].forEach(btn => {
      if (btn) btn.classList.remove('active');
    });

    // Set active status
    if (status === 'draft' && draftBtn) {
      draftBtn.classList.add('active');
    } else if (status === 'published' && publishBtn) {
      publishBtn.classList.add('active');
    }

    // Update archive button
    if (archiveBtn) {
      if (archived) {
        archiveBtn.classList.add('active');
        archiveBtn.innerHTML = '<i class="fas fa-unarchive"></i> Unarchive';
      } else {
        archiveBtn.classList.remove('active');
        archiveBtn.innerHTML = '<i class="fas fa-archive"></i> Archive';
      }
    }

    // Enable/disable publish button based on archive status
    if (publishBtn) {
      publishBtn.disabled = archived;
    }
  }

  async updateStatus(newStatus) {
    if (!this.currentArticleId) return;

    // First save any current changes
    await this.saveArticle();

    try {
      const formData = this.getFormData();
      formData.status = newStatus;

      const response = await fetch(`/admin/articles/${this.currentArticleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        },
        body: JSON.stringify({ article: formData })
      });

      if (response.ok) {
        const currentArticle = document.querySelector(`[data-article-id="${this.currentArticleId}"]`);
        if (currentArticle) {
          const statusBadge = currentArticle.querySelector('.status-badge');
          if (statusBadge) {
            statusBadge.className = `status-badge status-${newStatus}`;
            statusBadge.textContent = newStatus;
          }
        }
        
        this.updateStatusButtons(newStatus, false);
        // Update stats without full reload
        this.updateStats();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  async toggleArchive() {
    if (!this.currentArticleId) return;

    try {
      const response = await fetch(`/admin/articles/${this.currentArticleId}/archive`, {
        method: 'PATCH',
        headers: {
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        }
      });

      if (response.ok) {
        // Reload the page to refresh the UI
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to toggle archive:', error);
    }
  }

  async createNewArticle() {
    const formData = {
      title: 'New Article',
      body: '<div>Start writing your article here...</div>',
      status: 'draft'
    };

    try {
      const response = await fetch('/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        },
        body: JSON.stringify({ article: formData })
      });

      if (response.ok) {
        // Reload the page to show the new article
        window.location.reload();
      } else {
        console.error('Failed to create article:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to create article:', error);
    }
  }

  async searchArticles(query) {
    try {
      const response = await fetch(`/admin/articles/search?q=${encodeURIComponent(query)}`);
      const articles = await response.json();
      
      this.updateArticlesList(articles);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }

  updateArticlesList(articles) {
    const articlesList = document.getElementById('articles-list');
    if (!articlesList) return;

    if (articles.length === 0) {
      articlesList.innerHTML = '<div class="empty-articles"><p>No articles found.</p></div>';
      return;
    }

    articlesList.innerHTML = articles.map((article, index) => `
      <div class="article-item ${index === 0 ? 'active' : ''}" data-article-id="${article.id}">
        <div class="article-item-title">${this.truncate(article.title, 50)}</div>
        <div class="article-item-meta">
          <span class="article-date">${article.created_at}</span>
          <span class="status-badge status-${article.status}">${article.status}</span>
        </div>
      </div>
    `).join('');
  }

  async filterArticles(filter) {
    // Update active stat card (only for filterable cards)
    document.querySelectorAll('.stat-card[data-filter]').forEach(card => {
      card.classList.remove('active');
    });
    
    const targetCard = document.querySelector(`[data-filter="${filter}"]`);
    if (targetCard) {
      targetCard.classList.add('active');
    }

    try {
      // Navigate to filtered view
      const url = new URL(window.location);
      url.searchParams.set('filter', filter);
      window.location.href = url.toString();
    } catch (error) {
      console.error('Failed to filter articles:', error);
    }
  }

  refreshArticlesList() {
    // For now, just reload the page
    // In a more sophisticated implementation, we'd fetch and update the list
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  loadInitialArticle() {
    // Wait for Trix editor to be ready
    const waitForTrix = () => {
      const trixEditor = document.querySelector('trix-editor');
      if (trixEditor && trixEditor.editor) {
        const firstArticle = document.querySelector('.article-item.active');
        if (firstArticle) {
          const articleId = firstArticle.dataset.articleId;
          if (articleId) {
            this.loadArticle(articleId);
          }
        }
      } else {
        setTimeout(waitForTrix, 100);
      }
    };
    
    waitForTrix();
  }

  async updateStats() {
    try {
      const response = await fetch('/admin/articles/stats');
      const stats = await response.json();
      
      // Update stat cards
      document.querySelector('[data-filter="published"] .stat-number').textContent = stats.published;
      document.querySelector('[data-filter="drafts"] .stat-number').textContent = stats.drafts;
      document.querySelector('[data-filter="archived"] .stat-number').textContent = stats.archived;
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  }

  truncate(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
}

// Initialize admin dashboard when DOM is loaded
let adminDashboardInstance = null;

const initializeAdminDashboard = () => {
  if (document.querySelector('.admin-dashboard') && !adminDashboardInstance) {
    // Wait for Trix to be fully loaded before initializing
    const startDashboard = () => {
      if (window.Trix || document.querySelector('trix-editor')) {
        adminDashboardInstance = new AdminDashboard();
      } else {
        setTimeout(startDashboard, 100);
      }
    };
    startDashboard();
  }
};

document.addEventListener('DOMContentLoaded', initializeAdminDashboard);
document.addEventListener('turbo:load', initializeAdminDashboard);
