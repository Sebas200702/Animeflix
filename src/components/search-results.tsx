import { AnimeResult } from '@components/anime-result'
import { useSearchStoreResults } from '@store/search-results-store'
import { useEffect, useState } from 'react'

export const SearchResults = () => {
  const [fadeIn, setFadeIn] = useState(false)
  const { results: animes, query, loading } = useSearchStoreResults()

  useEffect(() => {
    if (!animes) return
    setTimeout(() => setFadeIn(true), 300)
  }, [animes, setFadeIn, query])

  if (!animes || loading) {
    return (
      <div className="grid w-full grid-cols-3 gap-4">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={i + 1}
              className="flex h-28 w-full animate-pulse flex-row items-center gap-6 rounded-lg bg-gray-200 p-4 duration-200"
            >
              <div className="aspect-[225/330] h-full w-[20%] animate-pulse rounded-lg bg-gray-400 duration-200"></div>
              <div className="flex h-full w-full flex-col justify-center gap-2">
                <div className="h-[30%] w-[60%] animate-pulse rounded-lg bg-gray-400 duration-200"></div>
                <div className="h-[30%] w-[20%] animate-pulse rounded-full bg-gray-400 duration-200"></div>
              </div>
            </div>
          ))}
      </div>
    )
  }

  if (animes.length === 0) {
    return (
      <div className="mt-9 flex h-full w-full flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900">No results found</h1>
      </div>
    )
  }

  return (
    <ul
      className={`grid w-full grid-cols-3 gap-4 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
    >
      {animes.map(({ title, image_webp, mal_id, type }) => (
        <AnimeResult
          key={mal_id}
          mal_id={mal_id}
          title={title}
          image_webp={image_webp}
          type={type}
        />
      ))}
    </ul>
  )
}
