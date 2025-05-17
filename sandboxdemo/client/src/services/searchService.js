import api from "./api";

// Perform a full search with filters
export const searchNotes = async (searchParams) => {
  const params = new URLSearchParams();

  // Add all search parameters to the query
  if (searchParams.query) params.append("query", searchParams.query);

  if (searchParams.tags) {
    if (Array.isArray(searchParams.tags)) {
      searchParams.tags.forEach((tag) => params.append("tags", tag));
    } else {
      params.append("tags", searchParams.tags);
    }
  }

  if (searchParams.folders) {
    if (Array.isArray(searchParams.folders)) {
      searchParams.folders.forEach((folder) =>
        params.append("folders", folder)
      );
    } else {
      params.append("folders", searchParams.folders);
    }
  }

  if (searchParams.dateFrom) params.append("dateFrom", searchParams.dateFrom);
  if (searchParams.dateTo) params.append("dateTo", searchParams.dateTo);
  if (searchParams.favorite) params.append("favorite", searchParams.favorite);
  if (searchParams.sortBy) params.append("sortBy", searchParams.sortBy);
  if (searchParams.sortOrder)
    params.append("sortOrder", searchParams.sortOrder);
  if (searchParams.limit) params.append("limit", searchParams.limit);
  if (searchParams.page) params.append("page", searchParams.page);

  const response = await api.get(`/search/notes?${params.toString()}`);
  return response.data;
};

// Get search suggestions
export const getSearchSuggestions = async (query) => {
  const response = await api.get(
    `/search/suggestions?query=${encodeURIComponent(query)}`
  );
  return response.data;
};

// Get recent searches
export const getRecentSearches = async () => {
  const response = await api.get("/search/recent");
  return response.data;
};

// Save a search query to recent searches
export const saveRecentSearch = async (query) => {
  // This would typically save to the backend, but we'll just use localStorage for now
  try {
    const recentSearches = JSON.parse(
      localStorage.getItem("recentSearches") || "[]"
    );

    // Add query to the beginning of the array
    recentSearches.unshift({
      query,
      timestamp: new Date().toISOString(),
    });

    // Keep only the most recent 10 searches
    const uniqueSearches = Array.from(
      new Set(recentSearches.map((s) => s.query))
    )
      .map((query) => recentSearches.find((s) => s.query === query))
      .slice(0, 10);

    localStorage.setItem("recentSearches", JSON.stringify(uniqueSearches));

    return { success: true };
  } catch (error) {
    console.error("Error saving recent search:", error);
    return { success: false, error };
  }
};

// Get local recent searches
export const getLocalRecentSearches = () => {
  try {
    const recentSearches = JSON.parse(
      localStorage.getItem("recentSearches") || "[]"
    );
    return { recentSearches };
  } catch (error) {
    console.error("Error getting local recent searches:", error);
    return { recentSearches: [] };
  }
};
