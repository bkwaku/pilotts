import React from 'react';
import { createRoot } from 'react-dom/client';
import MinimalistEditor from 'components/MinimalistEditor';

let editorInstance = null;

const initializeMinimalistEditor = () => {
  const editorContainer = document.getElementById('minimalist-editor-root');
  
  if (editorContainer && !editorInstance) {
    const articleId = editorContainer.dataset.articleId;
    const initialTitle = editorContainer.dataset.initialTitle || '';
    
    // Decode HTML entities from the data attribute
    const encodedBody = editorContainer.dataset.initialBody || '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = encodedBody;
    const initialBody = textarea.value;
    
    const autosaveUrl = editorContainer.dataset.autosaveUrl;
    const csrfToken = document.querySelector('[name="csrf-token"]').content;

    const handleAutosave = async (data) => {
      const saveStatus = document.getElementById('save-status-indicator');
      if (saveStatus) saveStatus.textContent = 'Saving...';

      try {
        const response = await fetch(autosaveUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({ article: data })
        });

        const result = await response.json();
        
        if (result.status === 'success') {
          if (saveStatus) saveStatus.textContent = 'Saved';
        } else {
          if (saveStatus) saveStatus.textContent = 'Error';
        }
      } catch (error) {
        console.error('Autosave error:', error);
        if (saveStatus) saveStatus.textContent = 'Error';
      }
    };

    const root = createRoot(editorContainer);
    editorInstance = root;
    root.render(
      React.createElement(MinimalistEditor, {
        articleId,
        initialTitle,
        initialBody,
        onAutosave: handleAutosave
      })
    );

    // Setup publish button
    const publishBtn = document.getElementById('publish-btn');
    if (publishBtn && articleId) {
      publishBtn.addEventListener('click', async () => {
        const saveStatus = document.getElementById('save-status-indicator');
        const isPublished = publishBtn.classList.contains('published');
        
        try {
          const response = await fetch(`/admin/articles/${articleId}/toggle_status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              'X-CSRF-Token': csrfToken
            }
          });

          const result = await response.json();
          
          if (result.status === 'success') {
            // Update button state
            if (result.article.status === 'published') {
              publishBtn.classList.add('published');
              publishBtn.innerHTML = '<i class="fas fa-check"></i> Published';
              if (saveStatus) saveStatus.textContent = 'Published';
            } else {
              publishBtn.classList.remove('published');
              publishBtn.innerHTML = '<i class="fas fa-upload"></i> Publish';
              if (saveStatus) saveStatus.textContent = 'Draft';
            }
          } else {
            if (saveStatus) saveStatus.textContent = 'Error';
          }
        } catch (error) {
          console.error('Publish error:', error);
          if (saveStatus) saveStatus.textContent = 'Error';
        }
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', initializeMinimalistEditor);
document.addEventListener('turbo:load', initializeMinimalistEditor);
