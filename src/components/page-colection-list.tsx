import { useEffect, useState } from 'react'

import { CollectionItem } from '@components/collection-item'

import type { Anime } from 'types'
interface Props {
  title: string
  id: string
}
export const PageColectionList = ({ title, id }: Props) => {
  const [url, setUrl] = useState('')
  const [animes, setAnimes] = useState<Anime[]>()
  useEffect(() => {
    const collection = JSON.parse(
      sessionStorage.getItem(`animeCollection_${id}`) ?? ''
    )
    if (!collection) return

    setUrl(`/api/animes?${collection.query}&banners_filter=false`)

    const getAnimes = async () => {
      if (!url) return
      const data = await fetch(url).then((res) => res.json())
      setAnimes(data.data)
    }
    getAnimes()
  }, [setAnimes, setUrl, url, id])

  if (!animes)
    return (
      <div className="mx-auto flex flex-col gap-4">
        <div className="mb-6 h-20 w-full animate-pulse rounded-lg bg-zinc-800 duration-300 ease-in-out md:mx-10 md:h-10 md:w-96"></div>
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          {Array(20)
            .fill(0)
            .map((_, i) => (
              <div
                key={i + 1}
                className="bg-secondary mx-auto flex aspect-[500/260] h-full w-full max-w-[500px] animate-pulse flex-row rounded-lg"
              >
                <div className="aspect-[225/330] h-full animate-pulse rounded-l-lg bg-zinc-800 object-cover object-center transition-all ease-in-out"></div>
              </div>
            ))}
        </div>
      </div>
    )

  return (
    <div className="mx-auto flex flex-col gap-4">
      <header className="flex flex-row justify-between">
        <h2 className="mb-6 h-20 overflow-hidden text-xl font-bold text-white md:h-auto md:px-10 md:text-3xl">
          {title}
        </h2>
      </header>
      <ul className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
        {animes.map((anime) => (
          <CollectionItem key={anime.mal_id} anime={anime} />
        ))}
      </ul>
    </div>
  )
}
