import '@styles/anime-banner.css'

import { useEffect, useState } from 'react'

import { WatchAnimeButton } from '@components/watch-anime'
import { useIndexStore } from '@store/index-store'
import { createImageUrlProxy } from '@utils/craete-imageurl-proxy'
import { createDynamicUrl } from '@utils/create-dynamic-url'
import { normalizeString } from '@utils/normalize-string'
import { reduceString } from '@utils/reduce-string'

export const AnimeBanner = ({ id }: { id: number }) => {
  const [bannerData, setBannerData] = useState<{
    imageUrl: string
    title: string
    synopsis: string
    mal_id: number
  } | null>(null)
  const animationNumber = id % 2 === 0 ? 1 : 2
  const { setAnimeBanners, animeBanners } = useIndexStore()
  const [loading, setLoading] = useState(true)

  const getBannerUrl = async (url: string) => {
    const response = await fetch(`/api/animes?${url}&banners_filter=true`).then(
      (res) => res.json()
    )
    const anime = response.data[0]

    if (!anime || animeBanners.includes(anime.mal_id)) {
      const { url: newUrl } = createDynamicUrl(1)
      return await getBannerUrl(newUrl)
    }

    return {
      imageUrl: anime.banner_image,
      title: anime.title,
      synopsis: anime.synopsis,
      mal_id: anime.mal_id,
    }
  }

  useEffect(() => {
    const fetchBannerData = async () => {
      const storedData = sessionStorage.getItem(`animeBanner_${id}`)
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        setBannerData(parsedData)
        setTimeout(() => {
          setLoading(false)
        }, 100)
        return
      }
      const { url } = createDynamicUrl(1)
      const data = await getBannerUrl(url)
      if (!data) return
      setBannerData(data)
      setAnimeBanners([...animeBanners, data.mal_id])
      sessionStorage.setItem(`animeBanner_${id}`, JSON.stringify(data))

      setTimeout(() => {
        setLoading(false)
      }, 100)
    }

    fetchBannerData()
  }, [])

  if (loading || !bannerData) {
    return (
      <div className="py-4">
        <div
          className={`py-4 anime-banner-${animationNumber} flex aspect-[1080/500] h-auto w-full animate-pulse items-center justify-center bg-zinc-800 transition-all duration-200 ease-in-out md:aspect-[1080/300]`}
        ></div>
      </div>
    )
  }

  const { imageUrl, title, synopsis, mal_id } = bannerData
  const slug = normalizeString(title)

  return (
    <section
      className={`anime-banner-${animationNumber} relative flex flex-row items-center py-4`}
    >
      <a
        href={`/${slug}_${mal_id}`}
        className="group h-full w-full transition-all duration-200 ease-in-out md:hover:opacity-95"
        aria-label={`View details for ${title}`}
      >
        <picture
          className="aspect-[1080/500] h-full w-full object-cover object-center md:aspect-[1080/300]"
          style={{
            backgroundImage: `url(${createImageUrlProxy(imageUrl, '100', '0', 'webp')})`,
          }}
        >
          <img
            src={createImageUrlProxy(imageUrl, '1920', '50', 'webp')}
            alt="Anime Banner"
            loading="lazy"
            className="aspect-[1080/500] h-full w-full object-cover object-center md:aspect-[1080/300]"
            width={720}
            height={300}
          />
        </picture>
        <div className="to-base absolute inset-0 bg-gradient-to-b from-transparent opacity-0 transition-all duration-500 ease-in-out md:group-hover:opacity-70" />
      </a>
      <div className="absolute z-10 mx-auto flex h-full w-full flex-col justify-between gap-4 bg-black/30 px-4 py-6 md:right-0 md:bottom-0 md:m-8 md:h-auto md:max-w-80 md:rounded-lg md:p-4">
        <a
          href={`/${slug}_${mal_id}`}
          className="transition-all duration-200 ease-in-out md:hover:opacity-95"
        >
          <h2 className="max-h-16 overflow-hidden text-center text-xl font-bold text-white md:text-2xl">
            {title}
          </h2>
        </a>

        <p className="max-h-32 overflow-hidden text-center text-sm text-white md:text-start">
          {reduceString(synopsis, 70)}
        </p>
        <WatchAnimeButton url={`/watch/${slug}_${mal_id}`} />
      </div>
    </section>
  )
}
