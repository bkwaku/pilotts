import React, { useState, useEffect, useCallback } from 'react';
import ArticlesList from './ArticlesList';
import ArticleEditor from './ArticleEditor';
import StatsCards from './StatsCards';
import FilterControls from './FilterControls';

const AdminDashboard = () => {
  const [articles, setArticles] = useState([]);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ published: 0, drafts: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch articles based on filter
  const fetchArticles = useCallback(async (filterType = 'all') => {
    try {
      const url = `/admin/articles${filterType !== 'all' ? `?filter=${filterType}` : ''}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
        setStats(data.stats || { published: 0, drafts: 0, archived: 0 });
        
        // Set the first article as current if none selected
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

  // Load initial data
  useEffect(() => {
    fetchArticles(filter);
  }, [filter, fetchArticles]);

  // Save article
  const saveArticle = async (articleData, isAutosave = false) => {
    if (!isAutosave) setSaving(true);
    
    try {
      const url = currentArticle?.id 
        ? `/admin/articles/${currentArticle.id}`
        : '/admin/articles';
      const method = currentArticle?.id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        },
        body: JSON.stringify({ article: articleData })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update current article with saved data
        if (data.article) {
          setCurrentArticle(data.article);
          
          // Update articles list
          if (currentArticle?.id) {
            setArticles(prev => prev.map(a => a.id === currentArticle.id ? data.article : a));
          } else {
            setArticles(prev => [data.article, ...prev]);
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

  // Update article status
  const updateArticleStatus = async (status) => {
    if (!currentArticle?.id) return;

    const articleData = {
      title: currentArticle.title,
      body: currentArticle.body,
      status: status
    };

    const result = await saveArticle(articleData);
    if (result.success) {
      // Update local state
      const updatedArticle = { ...currentArticle, status };
      setCurrentArticle(updatedArticle);
      setArticles(prev => prev.map(a => a.id === currentArticle.id ? updatedArticle : a));
      
      // Update stats
      fetchArticles(filter);
    }
    return result;
  };

  // Toggle archive status
  const toggleArchive = async () => {
    if (!currentArticle?.id) return;

    try {
      const response = await fetch(`/admin/articles/${currentArticle.id}/archive`, {
        method: 'PATCH',
        headers: {
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        }
      });

      if (response.ok) {
        fetchArticles(filter); // Refresh data
      }
    } catch (error) {
      console.error('Failed to toggle archive:', error);
    }
  };

  // Create new article
  const createNewArticle = async () => {
    const newArticle = {
      title: 'New Article',
      body: '<p>Start writing your article here...</p>',
      status: 'draft'
    };

    const result = await saveArticle(newArticle);
    if (result.success) {
      fetchArticles(filter);
    }
  };

  // Select article from list
  const selectArticle = (article) => {
    setCurrentArticle(article);
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="react-admin-dashboard">
      <StatsCards stats={stats} filter={filter} setFilter={setFilter} />
      <FilterControls filter={filter} setFilter={setFilter} />
      
      <div className="admin-dashboard">
        <ArticlesList
          articles={articles}
          currentArticle={currentArticle}
          onSelectArticle={selectArticle}
          onCreateNew={createNewArticle}
        />
        
        <ArticleEditor
          article={currentArticle}
          onSave={saveArticle}
          onUpdateStatus={updateArticleStatus}
          onToggleArchive={toggleArchive}
          saving={saving}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
