import React from 'react';

const StatsCards = ({ stats, filter, setFilter }) => {
  const totalArticles = stats.published + stats.drafts + stats.archived;

  const handleFilterClick = (filterType) => {
    setFilter(filterType);
  };

  return (
    <div className="stats-cards">
      <div className="stat-card stat-summary">
        <div className="stat-number">{totalArticles}</div>
        <div className="stat-label">Total Articles</div>
      </div>
      
      <div 
        className={`stat-card ${filter === 'published' ? 'active' : ''}`}
        onClick={() => handleFilterClick('published')}
      >
        <div className="stat-number">{stats.published}</div>
        <div className="stat-label">Published</div>
      </div>
      
      <div 
        className={`stat-card ${filter === 'drafts' ? 'active' : ''}`}
        onClick={() => handleFilterClick('drafts')}
      >
        <div className="stat-number">{stats.drafts}</div>
        <div className="stat-label">Drafts</div>
      </div>
      
      <div 
        className={`stat-card ${filter === 'archived' ? 'active' : ''}`}
        onClick={() => handleFilterClick('archived')}
      >
        <div className="stat-number">{stats.archived}</div>
        <div className="stat-label">Archived</div>
      </div>
    </div>
  );
};

export default StatsCards;
