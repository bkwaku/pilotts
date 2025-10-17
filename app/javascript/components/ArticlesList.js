import React, { useState } from 'react';

const ArticlesList = ({ 
  articles, 
  currentArticle, 
  onSelectArticle, 
  onCreateNew 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter articles based on search
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

  return (
    <div className="admin-sidebar">
      <div className="article-search">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search articles..."
          className="search-input"
        />
      </div>
      
      <div className="sidebar-actions">
        <button 
          className="btn btn-primary"
          onClick={onCreateNew}
        >
          <i className="fas fa-plus"></i> New Article
        </button>
      </div>

      <div className="articles-list">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <div
              key={article.id}
              className={`article-item ${currentArticle?.id === article.id ? 'active' : ''}`}
              onClick={() => onSelectArticle(article)}
            >
              <div className="article-item-title">
                {truncateTitle(article.title)}
              </div>
              <div className="article-item-meta">
                <span className="article-date">
                  {formatDate(article.created_at)}
                </span>
                <span className={`status-badge status-${article.status}`}>
                  {article.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-articles">
            <p>No articles found.</p>
            {searchQuery ? (
              <p>Try adjusting your search terms.</p>
            ) : (
              <button 
                className="btn btn-link"
                onClick={onCreateNew}
              >
                Create your first article
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesList;
