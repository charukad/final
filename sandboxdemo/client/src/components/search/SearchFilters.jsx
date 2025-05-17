import React, { useState } from "react";
import { useOrganization } from "../../contexts/OrganizationContext";
import DateRangePicker from "../common/DateRangePicker";

const SearchFilters = ({ searchParams, onFilterChange }) => {
  const { tags, folders, loading } = useOrganization();
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle filters visibility
  const toggleFilters = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle tag selection
  const handleTagChange = (tagId) => {
    const currentTags = [...searchParams.tags];

    if (currentTags.includes(tagId)) {
      onFilterChange({
        tags: currentTags.filter((id) => id !== tagId),
      });
    } else {
      onFilterChange({
        tags: [...currentTags, tagId],
      });
    }
  };

  // Handle folder selection
  const handleFolderChange = (folderId) => {
    const currentFolders = [...searchParams.folders];

    if (currentFolders.includes(folderId)) {
      onFilterChange({
        folders: currentFolders.filter((id) => id !== folderId),
      });
    } else {
      onFilterChange({
        folders: [...currentFolders, folderId],
      });
    }
  };

  // Handle date range change
  const handleDateRangeChange = (from, to) => {
    onFilterChange({
      dateFrom: from,
      dateTo: to,
    });
  };

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    onFilterChange({
      favorite: searchParams.favorite === "true" ? "" : "true",
    });
  };

  // Clear all filters
  const clearFilters = () => {
    onFilterChange({
      tags: [],
      folders: [],
      dateFrom: "",
      dateTo: "",
      favorite: "",
    });
  };

  // Check if any filters are applied
  const hasFilters =
    searchParams.tags.length > 0 ||
    searchParams.folders.length > 0 ||
    searchParams.dateFrom ||
    searchParams.dateTo ||
    searchParams.favorite === "true";

  return (
    <div className={`search-filters ${isExpanded ? "expanded" : ""}`}>
      <div className="filters-header">
        <button className="toggle-filters-button" onClick={toggleFilters}>
          <span>Filters</span>
          <span className="toggle-icon">{isExpanded ? "▼" : "▶"}</span>
        </button>

        {hasFilters && (
          <button className="clear-filters-button" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="filters-content">
          {loading ? (
            <div className="filters-loading">Loading filters...</div>
          ) : (
            <>
              <div className="filter-section">
                <h4 className="filter-title">Tags</h4>
                <div className="tags-filter">
                  {tags.length > 0 ? (
                    <div className="tags-grid">
                      {tags.map((tag) => (
                        <div
                          key={tag._id}
                          className={`filter-tag ${
                            searchParams.tags.includes(tag._id)
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => handleTagChange(tag._id)}
                        >
                          <span
                            className="tag-color"
                            style={{ backgroundColor: tag.color }}
                          ></span>
                          <span className="tag-name">{tag.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-message">No tags created yet</div>
                  )}
                </div>
              </div>

              <div className="filter-section">
                <h4 className="filter-title">Folders</h4>
                <div className="folders-filter">
                  {folders.length > 0 ? (
                    <div className="folders-grid">
                      {folders.map((folder) => (
                        <div
                          key={folder._id}
                          className={`filter-folder ${
                            searchParams.folders.includes(folder._id)
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => handleFolderChange(folder._id)}
                        >
                          <span
                            className="folder-color"
                            style={{ backgroundColor: folder.color }}
                          ></span>
                          <span className="folder-name">{folder.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-message">No folders created yet</div>
                  )}
                </div>
              </div>

              <div className="filter-section">
                <h4 className="filter-title">Date Range</h4>
                <DateRangePicker
                  startDate={searchParams.dateFrom}
                  endDate={searchParams.dateTo}
                  onChange={handleDateRangeChange}
                />
              </div>

              <div className="filter-section">
                <h4 className="filter-title">Other Filters</h4>
                <div className="other-filters">
                  <div
                    className={`filter-checkbox ${
                      searchParams.favorite === "true" ? "checked" : ""
                    }`}
                    onClick={handleFavoriteToggle}
                  >
                    <span className="checkbox-icon">
                      {searchParams.favorite === "true" ? "✓" : ""}
                    </span>
                    <span className="checkbox-label">Favorites Only</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
