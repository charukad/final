import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSearchSuggestions,
  getLocalRecentSearches,
} from "../../services/searchService";

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState({
    notes: [],
    tags: [],
    folders: [],
  });
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchBarRef = useRef(null);
  const suggestionsTimeoutRef = useRef(null);

  // Load recent searches on mount
  useEffect(() => {
    const { recentSearches } = getLocalRecentSearches();
    setRecentSearches(recentSearches);
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    // Clear previous timeout
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    if (!query.trim()) {
      setSuggestions({ notes: [], tags: [], folders: [] });
      return;
    }

    // Debounce search suggestions request
    suggestionsTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { suggestions } = await getSearchSuggestions(query);
        setSuggestions(suggestions);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, [query]);

  // Handle input change
  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
  };

  // Handle search submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    // Navigate to search results page
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);

    // Hide suggestions
    setShowSuggestions(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    switch (suggestion.type) {
      case "note":
        // Navigate to the note
        navigate(`/notes/${suggestion.id}`);
        break;
      case "tag":
        // Search by tag
        navigate(`/search?tag=${suggestion.id}`);
        break;
      case "folder":
        // Search by folder
        navigate(`/search?folder=${suggestion.id}`);
        break;
      default:
        break;
    }

    // Hide suggestions
    setShowSuggestions(false);
    setQuery("");
  };

  // Handle recent search click
  const handleRecentSearchClick = (recentSearch) => {
    navigate(`/search?q=${encodeURIComponent(recentSearch.query)}`);
    setShowSuggestions(false);
    setQuery("");
  };

  // Check if we have any suggestions or recent searches
  const hasSuggestions =
    suggestions.notes.length > 0 ||
    suggestions.tags.length > 0 ||
    suggestions.folders.length > 0;

  const hasRecentSearches = recentSearches.length > 0;

  // Render nothing if no suggestions or recent searches while showing suggestions
  const shouldShowDropdown =
    showSuggestions && (hasSuggestions || hasRecentSearches || loading);

  return (
    <div className="search-bar-container" ref={searchBarRef}>
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="search-input"
          placeholder="Search notes, tags, folders..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
        />
        <button type="submit" className="search-button">
          🔍
        </button>
      </form>

      {shouldShowDropdown && (
        <div className="search-suggestions">
          {loading ? (
            <div className="suggestions-loading">
              <div className="spinner-small"></div>
              <span>Loading suggestions...</span>
            </div>
          ) : (
            <>
              {hasSuggestions ? (
                <>
                  {suggestions.notes.length > 0 && (
                    <div className="suggestion-group">
                      <h4 className="suggestion-group-title">Notes</h4>
                      <ul className="suggestion-list">
                        {suggestions.notes.map((note) => (
                          <li
                            key={note.id}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(note)}
                          >
                            <span className="suggestion-icon">📄</span>
                            <span className="suggestion-text">
                              {note.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {suggestions.tags.length > 0 && (
                    <div className="suggestion-group">
                      <h4 className="suggestion-group-title">Tags</h4>
                      <ul className="suggestion-list">
                        {suggestions.tags.map((tag) => (
                          <li
                            key={tag.id}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(tag)}
                          >
                            <span
                              className="tag-color"
                              style={{ backgroundColor: tag.color }}
                            ></span>
                            <span className="suggestion-text">{tag.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {suggestions.folders.length > 0 && (
                    <div className="suggestion-group">
                      <h4 className="suggestion-group-title">Folders</h4>
                      <ul className="suggestion-list">
                        {suggestions.folders.map((folder) => (
                          <li
                            key={folder.id}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(folder)}
                          >
                            <span
                              className="folder-color"
                              style={{ backgroundColor: folder.color }}
                            ></span>
                            <span className="suggestion-text">
                              {folder.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                hasRecentSearches && (
                  <div className="suggestion-group">
                    <h4 className="suggestion-group-title">Recent Searches</h4>
                    <ul className="suggestion-list">
                      {recentSearches.map((search, index) => (
                        <li
                          key={index}
                          className="suggestion-item"
                          onClick={() => handleRecentSearchClick(search)}
                        >
                          <span className="suggestion-icon">🕒</span>
                          <span className="suggestion-text">
                            {search.query}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )}

              {!hasSuggestions && !hasRecentSearches && query.trim() !== "" && (
                <div className="no-suggestions">
                  <p>No suggestions found. Press Enter to search.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
