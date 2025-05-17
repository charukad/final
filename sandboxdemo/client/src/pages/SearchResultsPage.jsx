import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NoteCard from "../components/dashboard/NoteCard";
import NoteList from "../components/dashboard/NoteList";
import SearchFilters from "../components/search/SearchFilters";
import Pagination from "../components/common/Pagination";
import { searchNotes, saveRecentSearch } from "../services/searchService";
import "../styles/SearchResults.css";

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Get initial search parameters from URL
  const initialSearch = {
    query: queryParams.get("q") || "",
    tags: queryParams.getAll("tag") || [],
    folders: queryParams.getAll("folder") || [],
    dateFrom: queryParams.get("from") || "",
    dateTo: queryParams.get("to") || "",
    favorite: queryParams.get("favorite") || "",
    sortBy: queryParams.get("sort") || "updatedAt",
    sortOrder: queryParams.get("order") || "desc",
    page: parseInt(queryParams.get("page")) || 1,
  };

  const [searchParams, setSearchParams] = useState(initialSearch);
  const [searchResults, setSearchResults] = useState([]);
  const [pagination, setPagination] = useState({
    totalResults: 0,
    totalPages: 0,
    currentPage: 1,
    resultsPerPage: 20,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("grid"); // 'grid' or 'list'

  // Perform search when parameters change
  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      try {
        // Save query to recent searches if it exists
        if (searchParams.query) {
          saveRecentSearch(searchParams.query);
        }

        // Update URL with search parameters
        updateURL();

        // Search notes
        const response = await searchNotes({
          ...searchParams,
          limit: 20, // Fixed for now
        });

        setSearchResults(response.results);
        setPagination(response.pagination);
      } catch (error) {
        console.error("Search error:", error);
        setError("Failed to load search results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchParams]);

  // Update URL with current search parameters
  const updateURL = () => {
    const params = new URLSearchParams();

    if (searchParams.query) params.set("q", searchParams.query);

    searchParams.tags.forEach((tag) => params.append("tag", tag));
    searchParams.folders.forEach((folder) => params.append("folder", folder));

    if (searchParams.dateFrom) params.set("from", searchParams.dateFrom);
    if (searchParams.dateTo) params.set("to", searchParams.dateTo);
    if (searchParams.favorite) params.set("favorite", searchParams.favorite);
    if (searchParams.sortBy) params.set("sort", searchParams.sortBy);
    if (searchParams.sortOrder) params.set("order", searchParams.sortOrder);
    if (searchParams.page > 1) params.set("page", searchParams.page.toString());

    // Update URL without reloading the page
    navigate(
      {
        pathname: "/search",
        search: params.toString(),
      },
      { replace: true }
    );
  };

  // Handle search parameter changes
  const handleFilterChange = (newFilters) => {
    setSearchParams((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page on filter change
    }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setSearchParams((prev) => ({
      ...prev,
      page: newPage,
    }));

    // Scroll to top of results
    window.scrollTo(0, 0);
  };

  // Toggle view between grid and list
  const toggleView = () => {
    setView((prev) => (prev === "grid" ? "list" : "grid"));
  };

  // Loading state
  if (loading && pagination.totalResults === 0) {
    return (
      <div className="search-page">
        <div className="search-header">
          <h1>Search Results</h1>
          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        <SearchFilters
          searchParams={searchParams}
          onFilterChange={handleFilterChange}
        />

        <div className="search-loading">
          <div className="loading-spinner"></div>
          <p>Searching...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="search-page">
        <div className="search-header">
          <h1>Search Results</h1>
          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        <div className="search-error">
          <p>{error}</p>
          <button
            className="retry-button"
            onClick={() => setSearchParams({ ...searchParams })}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>
          {searchParams.query ? (
            <>Search Results for "{searchParams.query}"</>
          ) : (
            <>Search Results</>
          )}
        </h1>
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>

      <SearchFilters
        searchParams={searchParams}
        onFilterChange={handleFilterChange}
      />

      <div className="search-results-header">
        <div className="results-info">
          <span className="results-count">
            {pagination.totalResults}{" "}
            {pagination.totalResults === 1 ? "result" : "results"}
          </span>

          <div className="sort-controls">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={`${searchParams.sortBy}-${searchParams.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-");
                handleFilterChange({ sortBy, sortOrder });
              }}
            >
              <option value="updatedAt-desc">Last Updated (Newest)</option>
              <option value="updatedAt-asc">Last Updated (Oldest)</option>
              <option value="createdAt-desc">Created (Newest)</option>
              <option value="createdAt-asc">Created (Oldest)</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
            </select>
          </div>
        </div>

        <div className="view-controls">
          <button
            className={`view-button ${view === "grid" ? "active" : ""}`}
            onClick={() => setView("grid")}
            title="Grid View"
          >
            □□
          </button>
          <button
            className={`view-button ${view === "list" ? "active" : ""}`}
            onClick={() => setView("list")}
            title="List View"
          >
            ≡
          </button>
        </div>
      </div>

      {searchResults.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h2>No Results Found</h2>
          <p>
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
        </div>
      ) : (
        <>
          <div className={`search-results ${view}`}>
            {view === "grid" ? (
              <div className="notes-grid">
                {searchResults.map((note) => (
                  <NoteCard key={note._id} note={note} />
                ))}
              </div>
            ) : (
              <NoteList notes={searchResults} />
            )}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SearchResultsPage;
