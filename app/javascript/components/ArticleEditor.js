import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';

const ArticleEditor = ({ 
  article, 
  onSave, 
  onUpdateStatus, 
  onToggleArchive, 
  saving 
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saveStatus, setSaveStatus] = useState('ready');
  const [lastSaved, setLastSaved] = useState(null);
  const autosaveTimeoutRef = useRef(null);

  // Update local state when article changes
  useEffect(() => {
    if (article) {
      setTitle(article.title || '');
      setBody(article.body || '');
    } else {
      setTitle('');
      setBody('');
    }
  }, [article]);

  // Autosave functionality
  const scheduleAutosave = () => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    setSaveStatus('saving');

    autosaveTimeoutRef.current = setTimeout(async () => {
      if (article?.id && (title || body)) {
        const result = await onSave({ title, body, status: article.status }, true);
        if (result.success) {
          setSaveStatus('saved');
          setLastSaved(new Date().toLocaleTimeString());
        } else {
          setSaveStatus('error');
        }
      }
    }, 2000);
  };

  // Handle title changes
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    scheduleAutosave();
  };

  // Handle body changes
  const handleBodyChange = (content) => {
    setBody(content);
    scheduleAutosave();
  };

  // Manual save
  const handleSave = async () => {
    const result = await onSave({ title, body, status: article?.status || 'draft' });
    if (result.success) {
      setSaveStatus('saved');
      setLastSaved(new Date().toLocaleTimeString());
    } else {
      setSaveStatus('error');
      console.error('Save failed:', result.errors);
    }
  };

  // Status update handlers
  const handleStatusUpdate = async (status) => {
    if (article && article.status !== status) {
      const result = await onUpdateStatus(status);
      if (result.success) {
        setSaveStatus('saved');
      }
    }
  };

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'blockquote', 'code-block',
    'color', 'background', 'link', 'image'
  ];

  if (!article && !title && !body) {
    return (
      <div className="admin-editor">
        <div className="empty-editor">
          <h3>Select an article to edit or create a new one</h3>
          <p>Choose an article from the sidebar to start editing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-editor">
      <div className="editor-header">
        <div className="editor-title">
          {article?.id ? `Editing: ${title.substring(0, 30)}${title.length > 30 ? '...' : ''}` : 'New Article'}
        </div>
        
        <div className="editor-actions">
          <div className="status-controls">
            <button 
              type="button" 
              className={`toggle-btn ${article?.status === 'draft' ? 'active' : ''}`}
              onClick={() => handleStatusUpdate('draft')}
              disabled={saving}
            >
              <i className="fas fa-edit"></i> Draft
            </button>
            
            <button 
              type="button" 
              className={`toggle-btn ${article?.status === 'published' ? 'active' : ''}`}
              onClick={() => handleStatusUpdate('published')}
              disabled={saving || article?.archived}
            >
              <i className="fas fa-globe"></i> Publish
            </button>
            
            <button 
              type="button" 
              className={`toggle-btn archive-btn ${article?.archived ? 'active' : ''}`}
              onClick={onToggleArchive}
              disabled={saving}
            >
              <i className={`fas fa-${article?.archived ? 'unarchive' : 'archive'}`}></i>
              {article?.archived ? 'Unarchive' : 'Archive'}
            </button>
          </div>

          <button 
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            <i className="fas fa-save"></i> Save
          </button>
        </div>
      </div>

      <div className="editor-form">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Article title..."
          className="title-input"
          disabled={saving}
        />

        <div className="body-editor-react">
          <ReactQuill
            theme="snow"
            value={body}
            onChange={handleBodyChange}
            modules={modules}
            formats={formats}
            placeholder="Start writing your article..."
            style={{ height: '500px' }}
          />
        </div>

        <div className="autosave-indicator">
          <i 
            className={`fas ${
              saveStatus === 'saving' ? 'fa-circle' :
              saveStatus === 'saved' ? 'fa-check-circle' :
              saveStatus === 'error' ? 'fa-exclamation-circle' : 'fa-circle'
            }`}
            style={{ 
              color: saveStatus === 'saving' ? '#ffc107' :
                     saveStatus === 'saved' ? '#28a745' :
                     saveStatus === 'error' ? '#dc3545' : '#6c757d'
            }}
          ></i>
          <span>
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && (lastSaved ? `Saved at ${lastSaved}` : 'Saved')}
            {saveStatus === 'error' && 'Save failed'}
            {saveStatus === 'ready' && 'Auto-save enabled'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;
