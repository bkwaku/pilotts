import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// ArticlesList Component
const ArticlesList = ({ articles, currentArticle, onSelectArticle, onCreateNew, stats, filter, setFilter, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const truncateTitle = (title, maxLength = 50) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const totalArticles = stats ? stats.published + stats.drafts + stats.archived : 0;

  return React.createElement('div', { className: 'admin-sidebar' }, 
    React.createElement('div', { className: 'article-search' },
      React.createElement('input', {
        type: 'text',
        value: searchQuery,
        onChange: handleSearch,
        placeholder: 'Search articles...',
        className: 'search-input'
      })
    ),
    React.createElement('div', { className: 'sidebar-actions' },
      React.createElement('button', {
        className: 'btn btn-primary',
        onClick: onCreateNew
      }, React.createElement('i', { className: 'fas fa-plus' }), ' New Article')
    ),
    React.createElement('div', { className: 'articles-list' },
      loading 
        ? React.createElement('div', { className: 'loading-articles' }, 
            React.createElement('i', { className: 'fas fa-spinner fa-spin' }),
            React.createElement('span', null, ' Loading articles...')
          )
        : filteredArticles.length > 0 
        ? filteredArticles.map(article => 
            React.createElement('div', {
              key: article.id,
              className: `article-item ${currentArticle?.id === article.id ? 'active' : ''}`,
              onClick: () => onSelectArticle(article)
            },
              React.createElement('div', { className: 'article-item-title' }, truncateTitle(article.title)),
              React.createElement('div', { className: 'article-item-meta' },
                React.createElement('span', { className: 'article-date' }, formatDate(article.created_at)),
                React.createElement('span', { 
                  className: `status-badge status-${article.archived ? 'archived' : article.status}`,
                  key: `badge-${article.id}-${article.status}-${article.archived}` // Force re-render when status changes
                }, article.archived ? 'archived' : article.status)
              )
            )
          )
        : React.createElement('div', { className: 'empty-articles' },
            React.createElement('p', null, 'No articles found.'),
            searchQuery
              ? React.createElement('p', null, 'Try adjusting your search terms.')
              : React.createElement('div', null,
                  React.createElement('p', null, 'You haven\'t created any articles yet.'),
                  React.createElement('button', { 
                    className: 'btn btn-primary', 
                    onClick: onCreateNew 
                  }, 'Create your first article')
                )
          )
    ),
    React.createElement('div', { className: 'sidebar-footer' },
      React.createElement('div', { className: 'article-stats' },
        React.createElement('div', { className: 'stats-summary' },
          `${totalArticles} articles total`
        ),
        React.createElement('div', { className: 'stats-breakdown' },
          `${stats?.published || 0} published • ${stats?.drafts || 0} drafts • ${stats?.archived || 0} archived`
        )
      ),
      React.createElement('div', { className: 'filter-controls-sidebar' },
        React.createElement('button', {
          className: `filter-btn-small ${filter === 'all' ? 'active' : ''}`,
          onClick: () => setFilter('all')
        }, 'All'),
        React.createElement('button', {
          className: `filter-btn-small ${filter === 'published' ? 'active' : ''}`,
          onClick: () => setFilter('published')
        }, 'Published'),
        React.createElement('button', {
          className: `filter-btn-small ${filter === 'drafts' ? 'active' : ''}`,
          onClick: () => setFilter('drafts')
        }, 'Drafts'),
        React.createElement('button', {
          className: `filter-btn-small ${filter === 'archived' ? 'active' : ''}`,
          onClick: () => setFilter('archived')
        }, 'Archived')
      )
    )
  );
};

// Toggle Switch Component
const ToggleSwitch = ({ isActive, onToggle, disabled, activeLabel, inactiveLabel, icon }) => {
  const handleToggle = () => {
    console.log('Toggle clicked:', { isActive, activeLabel, inactiveLabel });
    if (!disabled && onToggle) {
      onToggle();
    }
  };

  return React.createElement('div', { className: 'toggle-switch-container' },
    React.createElement('button', {
      type: 'button',
      className: `toggle-switch ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`,
      onClick: handleToggle,
      disabled: disabled
    },
      React.createElement('div', { className: 'toggle-slider' },
        React.createElement('div', { className: 'toggle-knob' })
      )
    ),
    React.createElement('span', { className: 'toggle-label' },
      React.createElement('i', { className: `fas ${icon}` }),
      ` ${isActive ? activeLabel : inactiveLabel}`
    )
  );
};

// Enhanced Rich Text Editor with comprehensive formatting features
const SimpleRichTextEditor = ({ value, onChange, placeholder, style }) => {
  const editorRef = useRef(null);
  const [content, setContent] = useState(value || '');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [selectedRange, setSelectedRange] = useState(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    hiliteColor: false,
    h1: false,
    h2: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    blockquote: false
  });

  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      const newValue = value || '';
      if (editorRef.current.innerHTML !== newValue) {
        setContent(newValue);
        editorRef.current.innerHTML = newValue;
        
        // Ensure the editor remains focusable and clickable
        editorRef.current.contentEditable = true;
        
        // If this is a new empty editor, place cursor at the end
        if (newValue && !content) {
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.focus();
              // Place cursor at end of content
              const range = document.createRange();
              const sel = window.getSelection();
              if (editorRef.current.childNodes.length > 0) {
                range.setStartAfter(editorRef.current.lastChild);
              } else {
                range.setStart(editorRef.current, 0);
              }
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }, 100);
        }
      }
    }
  }, [value]);

  const handleInput = () => {
    const newContent = editorRef.current.innerHTML;
    setContent(newContent);
    onChange(newContent);
    updateActiveFormats();
  };

  const handleSelectionChange = () => {
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    try {
      // Get the current selection and check for block-level elements
      const selection = window.getSelection();
      const formats = {
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        hiliteColor: document.queryCommandState('hiliteColor') || isHighlighted(),
        h1: isInElement('H1'),
        h2: isInElement('H2'),
        insertUnorderedList: isInElement('UL'),
        insertOrderedList: isInElement('OL'),
        blockquote: isInElement('BLOCKQUOTE')
      };
      
      setActiveFormats(prevFormats => {
        // Only update if formats have actually changed to prevent unnecessary re-renders
        const hasChanged = Object.keys(formats).some(key => formats[key] !== prevFormats[key]);
        return hasChanged ? formats : prevFormats;
      });
    } catch (error) {
      console.log('Error checking command state:', error);
    }
  };

  const isInElement = (tagName) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return false;
    
    let element = selection.anchorNode;
    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentElement;
    }
    
    // Walk up the DOM tree to find the tag
    while (element && element !== editorRef.current) {
      if (element.tagName === tagName) {
        return true;
      }
      // Special handling for list items - check if we're inside a list
      if (tagName === 'UL' && element.tagName === 'LI') {
        let parent = element.parentElement;
        while (parent && parent !== editorRef.current) {
          if (parent.tagName === 'UL') return true;
          parent = parent.parentElement;
        }
      }
      if (tagName === 'OL' && element.tagName === 'LI') {
        let parent = element.parentElement;
        while (parent && parent !== editorRef.current) {
          if (parent.tagName === 'OL') return true;
          parent = parent.parentElement;
        }
      }
      element = element.parentElement;
    }
    return false;
  };

  const isHighlighted = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const parent = range.commonAncestorContainer;
      const element = parent.nodeType === Node.TEXT_NODE ? parent.parentElement : parent;
      
      // Check if the selection or its parent has highlighting
      if (element) {
        const computedStyle = window.getComputedStyle(element);
        const bgColor = computedStyle.backgroundColor;
        return bgColor === 'rgb(255, 255, 0)' || bgColor === 'yellow' || 
               element.style.backgroundColor === 'rgb(255, 255, 0)' ||
               element.style.backgroundColor === 'yellow' ||
               element.tagName === 'MARK';
      }
    }
    return false;
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      setSelectedRange(selection.getRangeAt(0).cloneRange());
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    selection.removeAllRanges();
    if (selectedRange) {
      selection.addRange(selectedRange);
    }
  };

  const execCommand = (command, value = null) => {
    editorRef.current.focus();
    document.execCommand(command, false, value);
    handleInput();
    updateActiveFormats();
  };

  const formatBlock = (tag) => {
    // Check if we're already in this format and toggle it off
    if ((tag === 'h1' && activeFormats.h1) || 
        (tag === 'h2' && activeFormats.h2)) {
      execCommand('formatBlock', '<p>');
    } else {
      execCommand('formatBlock', `<${tag}>`);
    }
  };

  const insertLink = () => {
    const selection = window.getSelection();
    if (selection.toString()) {
      setLinkText(selection.toString());
      saveSelection();
      setIsLinkModalOpen(true);
    } else {
      const url = prompt('Enter URL:');
      if (url) {
        execCommand('createLink', url);
      }
    }
  };

  const confirmLink = () => {
    if (linkUrl) {
      restoreSelection();
      if (linkText) {
        const linkHtml = `<a href="${linkUrl}" target="_blank">${linkText}</a>`;
        execCommand('insertHTML', linkHtml);
      } else {
        execCommand('createLink', linkUrl);
      }
    }
    setIsLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
    setSelectedRange(null);
  };

  const cancelLink = () => {
    setIsLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
    setSelectedRange(null);
  };

  const insertChecklist = () => {
    const checklistHtml = `
      <div class="checklist-item">
        <input type="checkbox" class="checklist-checkbox"> 
        <span class="checklist-text" contenteditable="true">Checklist item</span>
      </div>
    `;
    execCommand('insertHTML', checklistHtml);
  };

  const toggleHighlight = () => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    if (activeFormats.hiliteColor || isHighlighted()) {
      // Remove highlighting
      if (range.collapsed) {
        // If no text selected, try to remove highlight from current position
        const element = range.startContainer.nodeType === Node.TEXT_NODE 
          ? range.startContainer.parentElement 
          : range.startContainer;
        
        if (element && (element.style.backgroundColor || element.tagName === 'MARK')) {
          if (element.tagName === 'MARK') {
            // Replace MARK element with its text content
            const parent = element.parentNode;
            parent.insertBefore(document.createTextNode(element.textContent), element);
            parent.removeChild(element);
          } else {
            element.style.backgroundColor = '';
          }
        }
      } else {
        // Remove highlight from selected text
        execCommand('hiliteColor', 'transparent');
        
        // Also try to unwrap any MARK elements
        const selectedText = selection.toString();
        if (selectedText) {
          const span = document.createElement('span');
          span.style.backgroundColor = 'transparent';
          try {
            range.surroundContents(span);
          } catch (e) {
            execCommand('hiliteColor', 'transparent');
          }
        }
      }
    } else {
      // Add highlighting
      if (range.collapsed) {
        // If no text selected, do nothing
        return;
      } else {
        execCommand('hiliteColor', '#ffff00');
      }
    }
    
    handleInput();
    updateActiveFormats();
  };

  const insertQuote = () => {
    if (activeFormats.blockquote) {
      // Remove blockquote formatting
      execCommand('formatBlock', '<p>');
    } else {
      formatBlock('blockquote');
    }
  };

  const toggleStrikethrough = () => {
    execCommand('strikeThrough');
  };

  const toggleUnorderedList = () => {
    execCommand('insertUnorderedList');
    // Force update after a short delay to ensure DOM changes are reflected
    setTimeout(updateActiveFormats, 100);
  };

  const toggleOrderedList = () => {
    execCommand('insertOrderedList');
    // Force update after a short delay to ensure DOM changes are reflected
    setTimeout(updateActiveFormats, 100);
  };

  // Handle key events for shortcuts
  const handleKeyDown = (e) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'k':
          e.preventDefault();
          insertLink();
          break;
        default:
          break;
      }
    }
  };

  // Initialize editor and add event listeners
  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      // Ensure editor is properly initialized
      editor.contentEditable = true;
      editor.style.outline = 'none';
      
      // Add event listeners
      document.addEventListener('selectionchange', handleSelectionChange);
      editor.addEventListener('keyup', updateActiveFormats);
      editor.addEventListener('mouseup', updateActiveFormats);
      
      return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
        if (editor) {
          editor.removeEventListener('keyup', updateActiveFormats);
          editor.removeEventListener('mouseup', updateActiveFormats);
        }
      };
    }
  }, []);

  // Force editor initialization when component mounts
  useEffect(() => {
    if (editorRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.contentEditable = true;
          updateActiveFormats();
        }
      }, 100);
    }
  }, []);

  return React.createElement('div', { className: 'simple-editor-wrapper', style },
    React.createElement('div', { className: 'rich-text-toolbar' },
      // Heading buttons
      React.createElement('div', { className: 'toolbar-group' },
        React.createElement('button', {
          type: 'button',
          onClick: () => formatBlock('h1'),
          className: `toolbar-btn ${activeFormats.h1 ? 'active' : ''}`,
          title: 'Heading 1'
        }, React.createElement('i', { className: 'fas fa-heading' }), '1'),
        React.createElement('button', {
          type: 'button',
          onClick: () => formatBlock('h2'),
          className: `toolbar-btn ${activeFormats.h2 ? 'active' : ''}`,
          title: 'Heading 2'
        }, React.createElement('i', { className: 'fas fa-heading' }), '2'),
        React.createElement('button', {
          type: 'button',
          onClick: () => formatBlock('p'),
          className: 'toolbar-btn',
          title: 'Paragraph'
        }, React.createElement('i', { className: 'fas fa-paragraph' }))
      ),
      
      // Text formatting buttons
      React.createElement('div', { className: 'toolbar-group' },
        React.createElement('button', {
          type: 'button',
          onClick: () => execCommand('bold'),
          className: `toolbar-btn ${activeFormats.bold ? 'active' : ''}`,
          title: 'Bold (Cmd+B)'
        }, React.createElement('i', { className: 'fas fa-bold' })),
        React.createElement('button', {
          type: 'button',
          onClick: () => execCommand('italic'),
          className: `toolbar-btn ${activeFormats.italic ? 'active' : ''}`,
          title: 'Italic (Cmd+I)'
        }, React.createElement('i', { className: 'fas fa-italic' })),
        React.createElement('button', {
          type: 'button',
          onClick: () => execCommand('underline'),
          className: `toolbar-btn ${activeFormats.underline ? 'active' : ''}`,
          title: 'Underline (Cmd+U)'
        }, React.createElement('i', { className: 'fas fa-underline' })),
        React.createElement('button', {
          type: 'button',
          onClick: toggleStrikethrough,
          className: `toolbar-btn ${activeFormats.strikeThrough ? 'active' : ''}`,
          title: 'Strikethrough'
        }, React.createElement('i', { className: 'fas fa-strikethrough' })),
        React.createElement('button', {
          type: 'button',
          onClick: toggleHighlight,
          className: `toolbar-btn ${activeFormats.hiliteColor ? 'active' : ''}`,
          title: 'Toggle Highlight'
        }, React.createElement('i', { className: 'fas fa-highlighter' }))
      ),

      // List buttons
      React.createElement('div', { className: 'toolbar-group' },
        React.createElement('button', {
          type: 'button',
          onClick: toggleUnorderedList,
          className: `toolbar-btn ${activeFormats.insertUnorderedList ? 'active' : ''}`,
          title: 'Bullet List'
        }, React.createElement('i', { className: 'fas fa-list-ul' })),
        React.createElement('button', {
          type: 'button',
          onClick: toggleOrderedList,
          className: `toolbar-btn ${activeFormats.insertOrderedList ? 'active' : ''}`,
          title: 'Numbered List'
        }, React.createElement('i', { className: 'fas fa-list-ol' })),
        React.createElement('button', {
          type: 'button',
          onClick: insertChecklist,
          className: 'toolbar-btn',
          title: 'Checklist'
        }, React.createElement('i', { className: 'fas fa-tasks' }))
      ),

      // Special formatting buttons
      React.createElement('div', { className: 'toolbar-group' },
        React.createElement('button', {
          type: 'button',
          onClick: insertQuote,
          className: `toolbar-btn ${activeFormats.blockquote ? 'active' : ''}`,
          title: 'Quote'
        }, React.createElement('i', { className: 'fas fa-quote-left' })),
        React.createElement('button', {
          type: 'button',
          onClick: insertLink,
          className: 'toolbar-btn',
          title: 'Insert Link (Cmd+K)'
        }, React.createElement('i', { className: 'fas fa-link' })),
        React.createElement('button', {
          type: 'button',
          onClick: () => execCommand('removeFormat'),
          className: 'toolbar-btn',
          title: 'Clear Formatting'
        }, React.createElement('i', { className: 'fas fa-eraser' }))
      )
    ),

    // Link modal
    isLinkModalOpen && React.createElement('div', { className: 'link-modal-overlay' },
      React.createElement('div', { className: 'link-modal' },
        React.createElement('h3', null, 'Insert Link'),
        React.createElement('div', { className: 'link-form' },
          React.createElement('label', null, 'Link Text:'),
          React.createElement('input', {
            type: 'text',
            value: linkText,
            onChange: (e) => setLinkText(e.target.value),
            placeholder: 'Enter link text'
          }),
          React.createElement('label', null, 'URL:'),
          React.createElement('input', {
            type: 'url',
            value: linkUrl,
            onChange: (e) => setLinkUrl(e.target.value),
            placeholder: 'https://example.com'
          }),
          React.createElement('div', { className: 'link-modal-actions' },
            React.createElement('button', {
              onClick: cancelLink,
              className: 'btn btn-secondary'
            }, 'Cancel'),
            React.createElement('button', {
              onClick: confirmLink,
              className: 'btn btn-primary'
            }, 'Insert Link')
          )
        )
      )
    ),

    React.createElement('div', {
      ref: editorRef,
      contentEditable: true,
      className: 'rich-text-editor-content',
      tabIndex: 0,
      onInput: handleInput,
      onPaste: handlePaste,
      onKeyDown: handleKeyDown,
      onClick: (e) => {
        // Ensure editor is focusable on click
        e.preventDefault();
        if (editorRef.current) {
          editorRef.current.focus();
          // Also update active formats
          setTimeout(updateActiveFormats, 50);
        }
      },
      onFocus: () => {
        // Update active formats when editor gains focus
        setTimeout(updateActiveFormats, 50);
      },
      onMouseDown: (e) => {
        // Ensure click events work properly
        e.stopPropagation();
      },
      placeholder: placeholder,
      suppressContentEditableWarning: true
    })
  );
};

// ArticleEditor Component
const ArticleEditor = ({ article, onSave, onUpdateStatus, onToggleArchive, saving }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saveStatus, setSaveStatus] = useState('ready');
  const [lastSaved, setLastSaved] = useState(null);
  const autosaveTimeoutRef = useRef(null);

  useEffect(() => {
    console.log('Article changed:', article);
    if (article) {
      setTitle(article.title || '');
      setBody(article.html_body || '');
      console.log('Set body to:', article.html_body);
    } else {
      setTitle('');
      setBody('');
    }
  }, [article]);

  const scheduleAutosave = () => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    setSaveStatus('saving');

    autosaveTimeoutRef.current = setTimeout(async () => {
      if (article?.id && (title || body)) {
        const result = await onSave({ title, html_body: body, status: article.status }, true);
        if (result.success) {
          setSaveStatus('saved');
          setLastSaved(new Date().toLocaleTimeString());
        } else {
          setSaveStatus('error');
        }
      }
    }, 2000);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    scheduleAutosave();
  };

  const handleBodyChange = (content) => {
    setBody(content);
    scheduleAutosave();
  };

  const handleSave = async () => {
    const result = await onSave({ title, html_body: body, status: article?.status || 'draft' });
    if (result.success) {
      setSaveStatus('saved');
      setLastSaved(new Date().toLocaleTimeString());
    } else {
      setSaveStatus('error');
      console.error('Save failed:', result.errors);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (article && article.status !== status) {
      const result = await onUpdateStatus(status);
      if (result.success) {
        setSaveStatus('saved');
      }
    }
  };

  if (!article && !title && !body) {
    return React.createElement('div', { className: 'admin-editor' },
      React.createElement('div', { className: 'empty-editor' },
        React.createElement('h3', null, 'Select an article to edit or create a new one'),
        React.createElement('p', null, 'Choose an article from the sidebar to start editing.')
      )
    );
  }

  return React.createElement('div', { className: 'admin-editor' },
    React.createElement('div', { className: 'editor-header' },
      React.createElement('div', { className: 'editor-title-section' },
        React.createElement('label', { className: 'title-label' }, 'Article Title'),
        React.createElement('input', {
          type: 'text',
          value: title,
          onChange: handleTitleChange,
          placeholder: 'Enter article title...',
          className: 'title-input-header',
          disabled: saving
        })
      ),
      React.createElement('div', { className: 'editor-actions' },
        React.createElement('div', { className: 'status-controls-horizontal' },
          React.createElement(ToggleSwitch, {
            isActive: article?.status === 'published',
            onToggle: () => {
              const newStatus = article?.status === 'published' ? 'draft' : 'published';
              handleStatusUpdate(newStatus);
            },
            disabled: saving || article?.archived,
            activeLabel: 'Published',
            inactiveLabel: 'Draft',
            icon: article?.status === 'published' ? 'fa-globe' : 'fa-edit'
          }),
          React.createElement(ToggleSwitch, {
            isActive: article?.archived,
            onToggle: onToggleArchive,
            disabled: saving,
            activeLabel: 'Archived',
            inactiveLabel: 'Active',
            icon: article?.archived ? 'fa-archive' : 'fa-folder-open'
          })
        )
      )
    ),
    React.createElement('div', { className: 'editor-form' },
      React.createElement('div', { className: 'body-editor-react' },
        React.createElement(SimpleRichTextEditor, {
          value: body,
          onChange: handleBodyChange,
          placeholder: 'Start writing your article...',
          style: { height: '500px' }
        })
      ),
      React.createElement('div', { className: 'autosave-indicator' },
        React.createElement('div', { className: 'save-status' },
          saveStatus === 'saving' && React.createElement('div', { className: 'saving-spinner' },
            React.createElement('i', { className: 'fas fa-spinner fa-spin' }),
            React.createElement('span', null, 'Saving...')
          ) ||
          saveStatus === 'saved' && React.createElement('div', { className: 'saved-status' },
            React.createElement('i', { className: 'fas fa-check-circle' }),
            React.createElement('span', null, lastSaved ? `Saved at ${lastSaved}` : 'Saved')
          ) ||
          saveStatus === 'error' && React.createElement('div', { className: 'error-status' },
            React.createElement('i', { className: 'fas fa-exclamation-triangle' }),
            React.createElement('span', null, 'Save failed - will retry')
          ) ||
          React.createElement('div', { className: 'ready-status' },
            React.createElement('i', { className: 'fas fa-circle' }),
            React.createElement('span', null, 'Auto-save enabled')
          )
        )
      )
    )
  );
};

// StatsCards Component
const StatsCards = ({ stats, filter, setFilter }) => {
  const totalArticles = stats.published + stats.drafts + stats.archived;

  const handleFilterClick = (filterType) => {
    setFilter(filterType);
  };

  return React.createElement('div', { className: 'stats-cards' },
    React.createElement('div', { className: 'stat-card stat-summary' },
      React.createElement('div', { className: 'stat-number' }, totalArticles),
      React.createElement('div', { className: 'stat-label' }, 'Total Articles')
    ),
    React.createElement('div', {
      className: `stat-card ${filter === 'published' ? 'active' : ''}`,
      onClick: () => handleFilterClick('published')
    },
      React.createElement('div', { className: 'stat-number' }, stats.published),
      React.createElement('div', { className: 'stat-label' }, 'Published')
    ),
    React.createElement('div', {
      className: `stat-card ${filter === 'drafts' ? 'active' : ''}`,
      onClick: () => handleFilterClick('drafts')
    },
      React.createElement('div', { className: 'stat-number' }, stats.drafts),
      React.createElement('div', { className: 'stat-label' }, 'Drafts')
    ),
    React.createElement('div', {
      className: `stat-card ${filter === 'archived' ? 'active' : ''}`,
      onClick: () => handleFilterClick('archived')
    },
      React.createElement('div', { className: 'stat-number' }, stats.archived),
      React.createElement('div', { className: 'stat-label' }, 'Archived')
    )
  );
};

// FilterControls Component
const FilterControls = ({ filter, setFilter }) => {
  const filters = [
    { key: 'all', label: 'All Articles' },
    { key: 'published', label: 'Published' },
    { key: 'drafts', label: 'Drafts' },
    { key: 'archived', label: 'Archived' }
  ];

  return React.createElement('div', { className: 'filter-controls' },
    filters.map(({ key, label }) =>
      React.createElement('button', {
        key: key,
        className: `filter-btn ${filter === key ? 'active' : ''}`,
        onClick: () => setFilter(key)
      }, label)
    )
  );
};

// Main AdminDashboard Component
const AdminDashboard = () => {
  const [articles, setArticles] = useState([]);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ published: 0, drafts: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchArticles = useCallback(async (filterType = 'all', page = 1, limit = 100) => {
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.append('filter', filterType);
      }
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const url = `/admin/articles?${params.toString()}`;
      console.log('Fetching articles:', url);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Articles fetched:', data);
        
        setArticles(data.articles || []);
        setStats(data.stats || { published: 0, drafts: 0, archived: 0 });
        
        // Only set first article as current if no article is currently selected
        if (data.articles && data.articles.length > 0 && !currentArticle) {
          setCurrentArticle(data.articles[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  }, [currentArticle]);

  useEffect(() => {
    fetchArticles(filter);
  }, [filter, fetchArticles]);

  const saveArticle = async (articleData, isAutosave = false) => {
    if (!isAutosave) setSaving(true);
    
    try {
      const url = currentArticle?.id 
        ? `/admin/articles/${currentArticle.id}${isAutosave ? '/autosave' : ''}`
        : '/admin/articles';
      const method = currentArticle?.id ? 'PATCH' : 'POST';

      // Send html_body data 
      const requestData = {
        article: {
          title: articleData.title,
          html_body: articleData.html_body, // Store raw HTML
          status: articleData.status
        }
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.article) {
          // Create updated article with the latest data
          const updatedArticle = {
            ...currentArticle,
            ...data.article,
            title: articleData.title, // Ensure we use the latest title from the form
            html_body: articleData.html_body // Ensure we use the latest content
          };
          
          setCurrentArticle(updatedArticle);
          
          if (currentArticle?.id) {
            // Update existing article in the list
            setArticles(prev => prev.map(a => 
              a.id === currentArticle.id ? updatedArticle : a
            ));
          } else {
            // Add new article to the list
            setArticles(prev => [updatedArticle, ...prev]);
          }
        }
        
        return { success: true, message: data.message };
      } else {
        const errorData = await response.json();
        return { success: false, errors: errorData.errors };
      }
    } catch (error) {
      console.error('Save failed:', error);
      return { success: false, errors: ['Network error occurred'] };
    } finally {
      if (!isAutosave) setSaving(false);
    }
  };

  const updateArticleStatus = async (status) => {
    if (!currentArticle?.id) return;

    try {
      const response = await fetch(`/admin/articles/${currentArticle.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        },
        body: JSON.stringify({ 
          article: { 
            title: currentArticle.title,
            html_body: currentArticle.html_body,
            status: status 
          } 
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create updated article object with new status
        const updatedArticle = {
          ...currentArticle,
          title: data.article?.title || currentArticle.title,
          body: data.article?.body || currentArticle.body,
          status: data.article?.status || status,
          archived: data.article?.archived !== undefined ? data.article.archived : currentArticle.archived,
          updated_at: data.article?.updated_at || currentArticle.updated_at
        };
        
        console.log('Updating article status:', {
          from: currentArticle.status,
          to: status,
          updatedArticle: updatedArticle
        });
        
        // Immediately update React state
        setCurrentArticle(updatedArticle);
        
        // Update the articles list with the new article data
        setArticles(prev => {
          const newArticles = prev.map(a => 
            a.id === currentArticle.id ? updatedArticle : a
          );
          console.log('Updated articles list:', newArticles);
          return newArticles;
        });
        
        // Recalculate stats based on updated articles
        setArticles(prev => {
          const updatedArticles = prev.map(a => 
            a.id === currentArticle.id ? updatedArticle : a
          );
          
          const newStats = {
            published: updatedArticles.filter(a => a.status === 'published' && !a.archived).length,
            drafts: updatedArticles.filter(a => a.status === 'draft' && !a.archived).length,
            archived: updatedArticles.filter(a => a.archived).length
          };
          
          console.log('Updated stats:', newStats);
          setStats(newStats);
          
          return updatedArticles;
        });
        
        return { success: true, message: data.message };
      } else {
        const errorData = await response.json();
        console.error('Status update failed:', errorData);
        return { success: false, errors: errorData.errors };
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      return { success: false, errors: ['Network error occurred'] };
    }
  };

  const toggleArchive = async () => {
    if (!currentArticle?.id) return;

    try {
      const response = await fetch(`/admin/articles/${currentArticle.id}/archive`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create updated article with server response data
        const updatedArticle = {
          ...currentArticle,
          status: data.article.status,
          archived: data.article.archived,
          updated_at: data.article.updated_at
        };
        
        console.log('Toggling archive:', {
          from: { status: currentArticle.status, archived: currentArticle.archived },
          to: { status: updatedArticle.status, archived: updatedArticle.archived }
        });
        
        // Immediately update React state
        setCurrentArticle(updatedArticle);
        
        // Update the articles list and recalculate stats
        setArticles(prev => {
          const updatedArticles = prev.map(a => 
            a.id === currentArticle.id ? updatedArticle : a
          );
          
          const newStats = {
            published: updatedArticles.filter(a => a.status === 'published' && !a.archived).length,
            drafts: updatedArticles.filter(a => a.status === 'draft' && !a.archived).length,
            archived: updatedArticles.filter(a => a.archived).length
          };
          
          console.log('Archive toggle - updated stats:', newStats);
          setStats(newStats);
          
          return updatedArticles;
        });
        
        return { success: true, message: data.message };
      } else {
        const errorData = await response.json();
        console.error('Archive toggle failed:', errorData);
        return { success: false, errors: errorData.errors };
      }
    } catch (error) {
      console.error('Failed to toggle archive:', error);
      return { success: false, error: error.message };
    }
  };

  const createNewArticle = async () => {
    const newArticle = {
      title: 'New Article',
      html_body: '<p>Start writing your article here...</p>',
      status: 'draft'
    };

    console.log('Creating new article:', newArticle);

    try {
      const response = await fetch('/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        },
        body: JSON.stringify({ article: newArticle })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('New article created:', data);
        
        if (data.article) {
          // Add the new article to the beginning of the list
          setArticles(prev => [data.article, ...prev]);
          
          // Set it as the current article
          setCurrentArticle(data.article);
          
          // Update stats
          setStats(prev => ({
            ...prev,
            drafts: prev.drafts + 1
          }));
          
          return { success: true, article: data.article };
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to create article:', errorData);
        return { success: false, errors: errorData.errors };
      }
    } catch (error) {
      console.error('Error creating article:', error);
      return { success: false, errors: ['Network error occurred'] };
    }
  };

  const selectArticle = (article) => {
    setCurrentArticle(article);
  };

  if (loading) {
    return React.createElement('div', { className: 'loading' }, 'Loading dashboard...');
  }

  return React.createElement('div', { className: 'react-admin-dashboard' },
    React.createElement('div', { className: 'admin-dashboard' },
      React.createElement(ArticlesList, {
        articles,
        currentArticle,
        onSelectArticle: selectArticle,
        onCreateNew: createNewArticle,
        stats,
        filter,
        setFilter,
        loading
      }),
      React.createElement(ArticleEditor, {
        article: currentArticle,
        onSave: saveArticle,
        onUpdateStatus: updateArticleStatus,
        onToggleArchive: toggleArchive,
        saving
      })
    )
  );
};

// Initialize React admin dashboard
let adminDashboardInstance = null;

const initializeAdminDashboard = () => {
  const adminContainer = document.getElementById('react-admin-root');
  if (adminContainer && !adminDashboardInstance) {
    const root = createRoot(adminContainer);
    adminDashboardInstance = root;
    root.render(React.createElement(AdminDashboard));
  }
};

document.addEventListener('DOMContentLoaded', initializeAdminDashboard);
document.addEventListener('turbo:load', initializeAdminDashboard);
