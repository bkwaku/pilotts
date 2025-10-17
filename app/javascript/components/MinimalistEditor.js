import React, { useState, useEffect, useRef } from 'react';

const MinimalistEditor = ({ articleId, initialTitle, initialBody, onAutosave }) => {
  const [title, setTitle] = useState(initialTitle || '');
  const [body, setBody] = useState(initialBody || '');
  const [activeFormats, setActiveFormats] = useState({});
  
  const editorRef = useRef(null);
  const autosaveTimeoutRef = useRef(null);
  const toolbarRef = useRef(null);

  // Initialize editor content and auto-focus
  useEffect(() => {
    if (editorRef.current && initialBody !== undefined) {
      editorRef.current.innerHTML = initialBody || '';
      
      // Auto-focus the editor and position cursor
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          
          // Position cursor at the end if there's content, at beginning if empty
          const range = document.createRange();
          const selection = window.getSelection();
          
          if (editorRef.current.childNodes.length > 0) {
            // Position at the end of content
            const lastNode = editorRef.current.lastChild;
            if (lastNode.nodeType === Node.TEXT_NODE) {
              range.setStart(lastNode, lastNode.length);
            } else {
              range.setStartAfter(lastNode);
            }
          } else {
            // Empty editor - position at start
            range.setStart(editorRef.current, 0);
          }
          
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }, 100);
    }
  }, [initialBody]);

  // Update active formats on selection/cursor change
  useEffect(() => {
    const handleUpdate = () => {
      updateActiveFormats();
    };

    document.addEventListener('selectionchange', handleUpdate);
    return () => document.removeEventListener('selectionchange', handleUpdate);
  }, []);

  // Update active button states
  const updateActiveFormats = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    let node = selection.anchorNode;
    if (node.nodeType === 3) node = node.parentElement;

    const formats = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      h1: isInTag(node, 'H1'),
      h2: isInTag(node, 'H2'),
      h3: isInTag(node, 'H3'),
      insertUnorderedList: isInTag(node, 'UL'),
      insertOrderedList: isInTag(node, 'OL'),
      blockquote: isInTag(node, 'BLOCKQUOTE'),
      createLink: isInTag(node, 'A')
    };

    setActiveFormats(formats);
  };

  const isInTag = (node, tagName) => {
    let current = node;
    while (current && current !== editorRef.current) {
      if (current.tagName === tagName) return true;
      current = current.parentElement;
    }
    return false;
  };

  // Autosave functionality
  const triggerAutosave = (newBody = null) => {
    clearTimeout(autosaveTimeoutRef.current);
    
    autosaveTimeoutRef.current = setTimeout(() => {
      const bodyToSave = newBody || editorRef.current?.innerHTML || '';
      if (onAutosave) {
        onAutosave({ title, html_body: bodyToSave });
      }
    }, 2000);
  };

  // Title change handler
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    triggerAutosave();
  };

  // Editor input handler
  const handleEditorInput = () => {
    const newBody = editorRef.current.innerHTML;
    setBody(newBody);
    triggerAutosave(newBody);
    updateActiveFormats();
  };

  // Toolbar command execution
  const execCommand = (command, value = null) => {
    editorRef.current.focus();

    if (command.startsWith('h')) {
      // Heading toggle
      const selection = window.getSelection();
      let node = selection.anchorNode;
      if (node.nodeType === 3) node = node.parentElement;

      const isCurrentHeading = isInTag(node, command.toUpperCase());
      if (isCurrentHeading) {
        document.execCommand('formatBlock', false, 'p');
      } else {
        document.execCommand('formatBlock', false, command);
      }
    } else if (command === 'blockquote') {
      // Blockquote toggle
      const selection = window.getSelection();
      let node = selection.anchorNode;
      if (node.nodeType === 3) node = node.parentElement;

      const isCurrentBlockquote = isInTag(node, 'BLOCKQUOTE');
      if (isCurrentBlockquote) {
        document.execCommand('formatBlock', false, 'p');
      } else {
        document.execCommand('formatBlock', false, '<blockquote>');
      }
    } else if (command === 'createLink') {
      // Link creation
      const selection = window.getSelection();
      if (selection.toString().length === 0) {
        alert('Please select some text first to create a link.');
        return;
      }
      const url = prompt('Enter URL:', 'https://');
      if (url && url.trim() !== '' && url !== 'https://') {
        document.execCommand('createLink', false, url);
      }
    } else {
      // Standard commands
      document.execCommand(command, false, value);
    }

    handleEditorInput();
    updateActiveFormats();
  };

  // Keyboard shortcuts
  const handleKeyDown = (e) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? e.metaKey : e.ctrlKey;

    if (modKey) {
      switch (e.key.toLowerCase()) {
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
          execCommand('createLink');
          break;
      }
    }
  };

  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'minimalist-editor-container' },
      React.createElement('input', {
        type: 'text',
        value: title,
        onChange: handleTitleChange,
        placeholder: 'Title',
        className: 'title-input-minimalist',
        autoComplete: 'off'
      }),

      React.createElement('div', {
        ref: toolbarRef,
        className: 'fixed-toolbar',
        onMouseDown: (e) => e.preventDefault()
      },
      React.createElement('div', { className: 'toolbar-group' },
        React.createElement('button', {
          type: 'button',
          className: `toolbar-btn ${activeFormats.bold ? 'active' : ''}`,
          onClick: () => execCommand('bold'),
          title: 'Bold (Ctrl+B)'
        }, React.createElement('strong', null, 'B')),
        React.createElement('button', {
          type: 'button',
          className: `toolbar-btn ${activeFormats.italic ? 'active' : ''}`,
          onClick: () => execCommand('italic'),
          title: 'Italic (Ctrl+I)'
        }, React.createElement('em', null, 'I')),
        React.createElement('button', {
          type: 'button',
          className: `toolbar-btn ${activeFormats.underline ? 'active' : ''}`,
          onClick: () => execCommand('underline'),
          title: 'Underline (Ctrl+U)'
        }, React.createElement('u', null, 'U')),
        React.createElement('button', {
          type: 'button',
          className: `toolbar-btn ${activeFormats.strikeThrough ? 'active' : ''}`,
          onClick: () => execCommand('strikeThrough'),
          title: 'Strikethrough'
        }, React.createElement('s', null, 'S'))
      ),

      React.createElement('div', { className: 'toolbar-group' },
        React.createElement('button', {
          type: 'button',
          className: `toolbar-btn ${activeFormats.h1 ? 'active' : ''}`,
          onClick: () => execCommand('h1'),
          title: 'Heading 1'
        }, React.createElement('span', null, 'H1')),
        React.createElement('button', {
          type: 'button',
          className: `toolbar-btn ${activeFormats.h2 ? 'active' : ''}`,
          onClick: () => execCommand('h2'),
          title: 'Heading 2'
        }, React.createElement('span', null, 'H2')),
        React.createElement('button', {
          type: 'button',
          className: `toolbar-btn ${activeFormats.h3 ? 'active' : ''}`,
          onClick: () => execCommand('h3'),
          title: 'Heading 3'
        }, React.createElement('span', null, 'H3'))
      ),

      React.createElement('div', { className: 'toolbar-group' },
        React.createElement('button', {
          type: 'button',
          className: `toolbar-btn ${activeFormats.insertUnorderedList ? 'active' : ''}`,
          onClick: () => execCommand('insertUnorderedList'),
          title: 'Bullet List'
        }, React.createElement('span', null, '⦿')),
        React.createElement('button', {
          type: 'button',
          className: `toolbar-btn ${activeFormats.insertOrderedList ? 'active' : ''}`,
          onClick: () => execCommand('insertOrderedList'),
          title: 'Numbered List'
        }, React.createElement('span', null, '1.')),
        React.createElement('button', {
          type: 'button',
          className: `toolbar-btn ${activeFormats.blockquote ? 'active' : ''}`,
          onClick: () => execCommand('blockquote'),
          title: 'Quote'
        }, React.createElement('span', null, '"'))
      ),

      React.createElement('div', { className: 'toolbar-group' },
        React.createElement('button', {
          type: 'button',
          className: `toolbar-btn ${activeFormats.createLink ? 'active' : ''}`,
          onClick: () => execCommand('createLink'),
          title: 'Insert Link (Ctrl+K)'
        }, '🔗')
      )
      ),

      React.createElement('div', {
        ref: editorRef,
        id: 'rich-text-editor-content',
        className: 'rich-text-editor-content-minimalist',
        contentEditable: 'true',
        onInput: handleEditorInput,
        onKeyDown: handleKeyDown,
        onKeyUp: updateActiveFormats,
        onMouseUp: updateActiveFormats,
        'data-placeholder': 'Tell your story...',
        suppressContentEditableWarning: true
      })
    )
  );
};

export default MinimalistEditor;
