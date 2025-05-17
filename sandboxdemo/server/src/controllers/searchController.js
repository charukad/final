const Note = require("../models/Note");
const Tag = require("../models/Tag");
const Folder = require("../models/Folder");

// Perform a full-text search across user's notes
exports.searchNotes = async (req, res) => {
  try {
    const {
      query, // Text search query
      tags, // Array of tag IDs
      folders, // Array of folder IDs
      dateFrom, // Start date for filtering
      dateTo, // End date for filtering
      favorite, // Boolean for favorite status
      sortBy, // Field to sort by
      sortOrder, // 'asc' or 'desc'
      limit, // Number of results to return
      page, // Page number for pagination
    } = req.query;

    // Build search filter
    const filter = { user: req.user.id, isDeleted: false };

    // Add text search if query provided
    if (query && query.trim() !== "") {
      // We'll use MongoDB text search
      filter.$text = { $search: query };
    }

    // Add tag filter if provided
    if (tags) {
      const tagIds = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagIds };
    }

    // Add folder filter if provided
    if (folders) {
      const folderIds = Array.isArray(folders) ? folders : [folders];
      filter.folder = { $in: folderIds };
    }

    // Add date range filter if provided
    if (dateFrom || dateTo) {
      filter.updatedAt = {};

      if (dateFrom) {
        filter.updatedAt.$gte = new Date(dateFrom);
      }

      if (dateTo) {
        filter.updatedAt.$lte = new Date(dateTo);
      }
    }

    // Add favorite filter if provided
    if (favorite === "true") {
      filter.isFavorite = true;
    }

    // Set up pagination
    const resultsPerPage = parseInt(limit) || 20;
    const currentPage = parseInt(page) || 1;
    const skip = (currentPage - 1) * resultsPerPage;

    // Set up sorting
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    } else {
      // Default sort by updatedAt descending
      sort.updatedAt = -1;
    }

    // Perform search with pagination
    const notes = await Note.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(resultsPerPage)
      .populate("folder", "name color")
      .populate("tags", "name color")
      .lean();

    // Get total count for pagination
    const totalResults = await Note.countDocuments(filter);

    // Add text match score if text search was performed
    const results =
      query && query.trim() !== ""
        ? notes.map((note) => ({
            ...note,
            searchScore: note.score,
          }))
        : notes;

    // Return search results with pagination info
    res.json({
      results,
      pagination: {
        totalResults,
        totalPages: Math.ceil(totalResults / resultsPerPage),
        currentPage,
        resultsPerPage,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error during search" });
  }
};

// Get search suggestions
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.json({ suggestions: [] });
    }

    // Search for notes matching the query
    const noteMatches = await Note.find({
      user: req.user.id,
      isDeleted: false,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    })
      .limit(5)
      .select("title")
      .lean();

    // Search for tags matching the query
    const tagMatches = await Tag.find({
      user: req.user.id,
      name: { $regex: query, $options: "i" },
    })
      .limit(3)
      .select("name color")
      .lean();

    // Search for folders matching the query
    const folderMatches = await Folder.find({
      user: req.user.id,
      name: { $regex: query, $options: "i" },
    })
      .limit(3)
      .select("name color")
      .lean();

    // Build suggestions object
    const suggestions = {
      notes: noteMatches.map((note) => ({
        type: "note",
        id: note._id,
        title: note.title,
      })),
      tags: tagMatches.map((tag) => ({
        type: "tag",
        id: tag._id,
        name: tag.name,
        color: tag.color,
      })),
      folders: folderMatches.map((folder) => ({
        type: "folder",
        id: folder._id,
        name: folder.name,
        color: folder.color,
      })),
    };

    res.json({ suggestions });
  } catch (error) {
    console.error("Search suggestions error:", error);
    res
      .status(500)
      .json({ message: "Server error getting search suggestions" });
  }
};

// Get recent searches
exports.getRecentSearches = async (req, res) => {
  try {
    // In a real app, you would store recent searches in the database
    // For now, we'll return an empty array
    res.json({ recentSearches: [] });
  } catch (error) {
    console.error("Recent searches error:", error);
    res.status(500).json({ message: "Server error getting recent searches" });
  }
};
