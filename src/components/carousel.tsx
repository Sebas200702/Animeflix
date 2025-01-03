import { AnimeTag } from '@components/anime-tag'
import { useFetch } from '@hooks/useFetch'
import { createImageUrlProxy } from '@utils/craete-imageurl-proxy'
import { reduceSynopsis } from '@utils/reduce-synopsis'
import { normalizeString } from '@utils/normalize-string'
import { createDynamicBannersUrl } from '@utils/create-dynamic-banners-url'
import { useCarouselStore } from '@store/carousel-store'
import { memo, useCallback, useEffect } from 'react'
import { useCarouselScroll } from '@hooks/useCarouselScroll'
import type { Anime } from 'types'
import '@styles/no-scrolbar.css'
import '@styles/fade-out.css'

const Indicator = memo(
  ({
    index,
    currentIndex,
    onClick,
  }: {
    index: number
    currentIndex: number
    onClick: (index: number) => void
  }) => {
    return (
      <button
        onClick={() => onClick(index)}
        className={`h-3 w-3 rounded-full transition-colors ${
          currentIndex === index ? 'bg-blue-500' : 'bg-white/50'
        }`}
        aria-current={currentIndex === index ? 'true' : 'false'}
        aria-label={`Slide ${index + 1}`}
      />
    )
  }
)

const LoadingCarousel = () => (
  <div className="carousel-anime-banner relative h-[500px] animate-pulse bg-gray-200">
    <div className="relative flex h-full w-full flex-shrink-0 flex-col items-center px-8 py-4 md:flex-row">
      <div className="z-10 ml-5 flex h-auto max-h-[60%] w-full items-center justify-center p-4 md:h-full md:max-h-full md:w-1/3">
        <div className="mx-auto aspect-[225/330] h-auto w-full max-w-52 animate-pulse rounded-lg bg-gray-400 md:h-full md:max-h-[90%] md:w-auto md:max-w-full"></div>
      </div>
      <div className="z-10 mx-auto flex w-full flex-col items-center p-6 text-white md:ml-8 md:mr-16 md:items-start">
        <div className="z-30 mb-4 mt-4 h-8 w-full max-w-[70%] animate-pulse rounded-lg bg-gray-400 md:w-[60%]"></div>
        <div className="mb-6 hidden h-20 w-full animate-pulse rounded-lg bg-gray-400 md:flex"></div>
        <div className="h-8 w-[40%] animate-pulse rounded-lg bg-gray-400"></div>
      </div>
    </div>
    <div className="absolute bottom-6 left-1/2 z-30 flex h-6 w-60 -translate-x-1/2 animate-pulse rounded-lg bg-gray-400"></div>
  </div>
)

export const Carousel = () => {
  const {
    url,
    setUrl,
    banners,
    setBanners,
    loading,
    setLoading,
    currentIndex,
    setCurrentIndex,
    fadeIn,
    setFadeIn,
  } = useCarouselStore()
  const {
    bannerContainerRef,
    intervalRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handlePrev,
    handleNext,
    handleScroll,
    resetInterval,
    handleKeyDown,
  } = useCarouselScroll(banners, currentIndex, setCurrentIndex)

  const fetchBannerData = useCallback(async () => {
    if (typeof window === 'undefined') return
    const url = sessionStorage.getItem('banners-url') ?? ''
    const banners = JSON.parse(sessionStorage.getItem('banners') ?? '[]')
    setUrl(url)
    setBanners(banners)
    if (url || banners.length > 0) return

    const newUrl = createDynamicBannersUrl()
    setUrl(newUrl)
    sessionStorage.setItem('banners-url', newUrl)
    setLoading(true)
    setBanners([])
  }, [setUrl, setBanners, setLoading])

  const preloadImages = useCallback(() => {
    if (!banners || banners.length === 0) return
    banners.forEach((anime) => {
      const image = new Image()
      image.src = anime.image_large_webp
      image.src = createImageUrlProxy(anime.banner_image, '0', '10', 'webp')
    })
  }, [banners])

  const handleIndicatorClick = useCallback(
    (index: number) => {
      setCurrentIndex(index)
      handleScroll(index)
      resetInterval()
    },
    [setCurrentIndex, handleScroll, resetInterval]
  )

  useEffect(() => {
    fetchBannerData()
  }, [fetchBannerData])

  const { data: bannersData, loading: bannersLoading } = useFetch<Anime[]>({
    url: url,
  })

  useEffect(() => {
    if (!bannersData || bannersLoading) return
    setBanners(bannersData)
    sessionStorage.setItem('banners', JSON.stringify(bannersData))
    setLoading(false)
    preloadImages()
  }, [bannersData, bannersLoading, preloadImages, fetchBannerData])

  useEffect(() => {
    resetInterval()
  }, [resetInterval])

  useEffect(() => {
    if (!banners || banners.length === 0) return
    setFadeIn(true)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearInterval(intervalRef.current!)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [banners, handleNext, handlePrev, resetInterval])

  if (loading || !banners || banners.length === 0) return <LoadingCarousel />

  return (
    <div
      className={`carousel-anime-banner relative left-0 right-0 h-[500px] ${fadeIn ? 'opacity-100 transition-all duration-200' : 'opacity-0'} `}
      data-carousel="slide"
      style={{ position: 'sticky' }}
    >
      <div
        className="anime-list relative h-full overflow-x-auto"
        ref={bannerContainerRef}
        id="banner-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex h-full transition-transform duration-700 ease-in-out">
          {banners.map((anime, index) => (
            <div
              key={anime.mal_id}
              className={`relative flex h-full w-full flex-shrink-0 flex-col items-center justify-center px-8 md:justify-normal ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            >
              <div
                className="absolute inset-0 -z-10 h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${createImageUrlProxy(anime.banner_image, '0', '20', 'webp')})`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90" />
              <a
                href={`${normalizeString(anime.title)}_${anime.mal_id}`}
                className="z-10 flex h-auto max-h-[60%] w-full items-center justify-center p-4 md:h-full md:max-h-[90%] md:w-1/4"
              >
                <picture className="flex aspect-[225/330] h-auto max-h-72 w-full items-center justify-center rounded-lg object-cover object-center shadow-lg md:max-h-[90%]">
                  <img
                    src={anime.image_large_webp}
                    className="aspect-[225/330] h-auto max-h-72 w-auto rounded-lg object-cover object-center shadow-lg md:max-h-[90%]"
                    alt={anime.title}
                    loading="lazy"
                  />
                </picture>
              </a>
              <div
                className={`flex-1 p-6 ${index % 2 === 0 ? 'md:ml-8 md:mr-16' : 'md:ml-16 md:mr-8'} z-10 text-white`}
              >
                <a href={`${normalizeString(anime.title)}_${anime.mal_id}`}>
                  <h2 className="max-h-16 overflow-hidden text-center text-2xl font-bold text-white drop-shadow-md md:mb-4 md:text-left md:text-3xl">
                    {anime.title}
                  </h2>
                  <p className="mb-4 hidden text-base text-white drop-shadow md:flex">
                    {reduceSynopsis(anime.synopsis, 300)}
                  </p>
                </a>
                <footer className="mx-auto mt-4 flex w-full flex-row justify-center gap-2 md:justify-normal">
                  {anime.genres.slice(0, 3).map((tag: string) => (
                    <AnimeTag key={tag} tag={tag} type={tag} style="w-auto" />
                  ))}
                </footer>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 space-x-3">
        {banners.map((anime, index) => (
          <Indicator
            key={anime.mal_id}
            index={index}
            currentIndex={currentIndex}
            onClick={handleIndicatorClick}
          />
        ))}
      </div>
      <button
        type="button"
        className="group absolute start-0 top-0 z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
        onClick={handlePrev}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/30 group-hover:bg-black/50 group-focus:ring-2 group-focus:ring-white">
          <svg
            className="h-3 w-3 text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 1 1 5l4 4"
            />
          </svg>
          <span className="sr-only">Previous</span>
        </span>
      </button>

      <button
        type="button"
        className="group absolute end-0 top-0 z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
        onClick={handleNext}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/30 group-hover:bg-black/50 group-focus:ring-2 group-focus:ring-white">
          <svg
            className="h-3 w-3 text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 9 4-4-4-4"
            />
          </svg>
          <span className="sr-only">Next</span>
        </span>
      </button>
    </div>
  )
}
