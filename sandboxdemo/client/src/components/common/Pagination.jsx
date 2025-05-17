import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 7;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than max to show
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);

      // Calculate start and end of middle section
      let middleStart = Math.max(2, currentPage - 1);
      let middleEnd = Math.min(totalPages - 1, currentPage + 1);

      // Adjust to show more pages if we're at the edges
      if (currentPage <= 3) {
        middleEnd = Math.min(totalPages - 1, 5);
      } else if (currentPage >= totalPages - 2) {
        middleStart = Math.max(2, totalPages - 4);
      }

      // Add ellipsis after first page if needed
      if (middleStart > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = middleStart; i <= middleEnd; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (middleEnd < totalPages - 1) {
        pages.push("...");
      }

      // Always include last page
      pages.push(totalPages);
    }

    return pages;
  };

  // Handle page button click
  const handlePageClick = (page) => {
    if (page !== "..." && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Move to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // Move to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Don't render if only one page
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination">
      <button
        className="pagination-button prev"
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
      >
        ← Previous
      </button>

      <div className="page-numbers">
        {pageNumbers.map((page, index) => (
          <button
            key={index}
            className={`page-number ${page === currentPage ? "active" : ""} ${
              page === "..." ? "ellipsis" : ""
            }`}
            onClick={() => handlePageClick(page)}
            disabled={page === "..." || page === currentPage}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        className="pagination-button next"
        onClick={goToNextPage}
        disabled={currentPage === totalPages}
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
