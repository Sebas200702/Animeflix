import React, { useCallback } from 'react'
import { useSearchStoreResults } from '@store/search-results-store'
import { FilterDropdown } from '@components/filter-dropdown'
import { genreOptions, yearOptions, statusOptions, formatOptions } from '@utils'
import type { AppliedFilters } from 'types'

export const FilterSection: React.FC = () => {
  const { appliedFilters, setAppliedFilters, query, setQuery } =
    useSearchStoreResults()

  const handleReset = () => {
    setAppliedFilters({
      genre_filter: [],
      year_filter: [],
      status_filter: [],
      type_filter: [],
    })
  }

  const removeFilter = (category: keyof AppliedFilters, value: string) => {
    const currentValues = appliedFilters[category] ?? []
    const newValues = currentValues.filter((item) => item !== value)
    updateFilter(category, newValues)
  }

  const updateFilter = (category: keyof AppliedFilters, values: string[]) => {
    setAppliedFilters({
      ...appliedFilters,
      [category]: values.length > 0 ? values : [],
    })
  }
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value)
      window.history.pushState({}, '', `/search?q=${e.target.value}`)
    },
    [setQuery]
  )

  return (
    <div className="relative mx-auto w-full max-w-6xl space-y-4 p-4 md:max-w-5xl h-52">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
        <div className="relative">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Search
          </label>
          <input
            type="search"
            id="default-search"
            className="flex max-h-[80px] w-full flex-wrap items-start gap-1 overflow-y-auto rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400 focus:outline-none"
            placeholder="Search Animes..."
            value={query || ''}
            onInput={handleInput}
          />
        </div>

        <FilterDropdown
          label="Genres"
          values={appliedFilters.genre_filter ?? []}
          onChange={(values) => updateFilter('genre_filter', values)}
          onClear={() => updateFilter('genre_filter', [])}
          placeholder="Select Genres"
          options={genreOptions}
        />
        <FilterDropdown
          label="Year"
          values={appliedFilters.year_filter ?? []}
          onChange={(values) => updateFilter('year_filter', values)}
          onClear={() => updateFilter('year_filter', [])}
          placeholder="Any year"
          options={yearOptions}
        />
        <FilterDropdown
          label="Status"
          values={appliedFilters.status_filter ?? []}
          onChange={(values) => updateFilter('status_filter', values)}
          onClear={() => updateFilter('status_filter', [])}
          placeholder="Any Status"
          options={statusOptions}
        />
        <FilterDropdown
          label="Format"
          values={appliedFilters.type_filter ?? []}
          onChange={(values) => updateFilter('type_filter', values)}
          onClear={() => updateFilter('type_filter', [])}
          placeholder="Any Format"
          options={formatOptions}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Reset
          </label>
          <button
            onClick={handleReset}
            className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      {
        <div className="absolute bottom-0 left-0 right-0 h-24 rounded-md bg-gray-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">
            Applied Filters:
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(appliedFilters).map(([category, values]) =>
              values?.map((value) => (
                <span
                  key={`${category}-${value}`}
                  className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                >
                  {value}
                  <button
                    onClick={() =>
                      removeFilter(category as keyof AppliedFilters, value)
                    }
                    className="ml-1 inline-flex h-4 w-4 items-center justify-center text-blue-400 hover:text-blue-500"
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      }
    </div>
  )
}
