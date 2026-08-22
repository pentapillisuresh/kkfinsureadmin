import React from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Don't show pagination if there is only one page
  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(
      1,
      currentPage -
        Math.floor(maxVisiblePages / 2)
    );

    let endPage = Math.min(
      totalPages,
      startPage + maxVisiblePages - 1
    );

    // Adjust start page if we are near the last page
    if (
      endPage - startPage <
      maxVisiblePages - 1
    ) {
      startPage = Math.max(
        1,
        endPage - maxVisiblePages + 1
      );
    }

    for (
      let page = startPage;
      page <= endPage;
      page++
    ) {
      pages.push(page);
    }

    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-4">

      {/* Previous */}
      <button
        type="button"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="
          p-2
          rounded-lg
          border
          border-gray-300
          disabled:opacity-50
          disabled:cursor-not-allowed
          hover:bg-gray-50
          transition-colors
        "
        aria-label="Previous page"
      >
        <FaChevronLeft className="text-sm" />
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page) => (
        <button
          type="button"
          key={page}
          onClick={() => onPageChange(page)}
          aria-current={
            page === currentPage
              ? 'page'
              : undefined
          }
          className={`
            min-w-[40px]
            px-3
            py-1.5
            rounded-lg
            transition-colors
            ${
              page === currentPage
                ? 'bg-primary-600 text-white'
                : 'hover:bg-gray-100 border border-gray-300'
            }
          `}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        type="button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="
          p-2
          rounded-lg
          border
          border-gray-300
          disabled:opacity-50
          disabled:cursor-not-allowed
          hover:bg-gray-50
          transition-colors
        "
        aria-label="Next page"
      >
        <FaChevronRight className="text-sm" />
      </button>

    </div>
  );
};

export default Pagination;