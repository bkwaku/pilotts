import React from 'react';

const FilterControls = ({ filter, setFilter }) => {
  const filters = [
    { key: 'all', label: 'All Articles' },
    { key: 'published', label: 'Published' },
    { key: 'drafts', label: 'Drafts' },
    { key: 'archived', label: 'Archived' }
  ];

  return (
    <div className="filter-controls">
      {filters.map(({ key, label }) => (
        <button
          key={key}
          className={`filter-btn ${filter === key ? 'active' : ''}`}
          onClick={() => setFilter(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default FilterControls;
