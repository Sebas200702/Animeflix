import { useState } from 'react'

interface PaginationProps {
  totalPages: number
  initialPage?: number
  onPageChange?: (page: number) => void
}

export default function Pagination({
  totalPages,
  initialPage = 1,
  onPageChange,
}: PaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    onPageChange?.(page)
  }

  const renderPageNumbers = () => {
    const pages = []

    pages.push(
      <button
        key={1}
        onClick={() => handlePageChange(1)}
        className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${
          currentPage === 1
            ? 'bg-enfasisColor text-white'
            : 'bg-transparent text-gray-300 hover:text-white'
        }`}
      >
        1
      </button>
    )

    if (currentPage > 3) {
      pages.push(
        <span
          key="dots-1"
          className="flex h-8 w-8 items-center justify-center text-sm text-gray-500"
        >
          ...
        </span>
      )
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${
            currentPage === i
              ? 'bg-enfasisColor text-white'
              : 'bg-transparent text-gray-300 hover:text-white'
          }`}
        >
          {i}
        </button>
      )
    }

    if (currentPage < totalPages - 2) {
      pages.push(
        <span
          key="dots-2"
          className="flex h-8 w-8 items-center justify-center text-sm text-gray-500"
        >
          ...
        </span>
      )
    }

    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${
            currentPage === totalPages
              ? 'bg-enfasisColor text-white'
              : 'bg-transparent text-gray-300 hover:text-white'
          }`}
        >
          {totalPages}
        </button>
      )
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center gap-4 p-4">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-transparent text-sm text-gray-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Previous page"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div className="flex items-center gap-2">{renderPageNumbers()}</div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-transparent text-sm text-gray-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Next page"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
