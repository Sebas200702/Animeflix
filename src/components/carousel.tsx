import '@styles/no-scrollbar.css'
import '@styles/fade-out.css'

import { memo, useCallback, useEffect } from 'react'

import { WatchAnimeButton } from '@components/watch-anime'
import { useCarouselScroll } from '@hooks/useCarouselScroll'
import { useFetch } from '@hooks/useFetch'
import { useCarouselStore } from '@store/carousel-store'
import { createImageUrlProxy } from '@utils/craete-imageurl-proxy'
import { createDynamicUrl } from '@utils/create-dynamic-url'
import { normalizeString } from '@utils/normalize-string'
import { reduceString } from '@utils/reduce-string'

import type { Anime } from 'types'
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
        className={`h-3 rounded-full transition-all duration-300 ease-in-out ${
          currentIndex === index ? 'bg-enfasisColor w-8' : 'w-3 bg-white'
        }`}
        aria-current={currentIndex === index ? 'true' : 'false'}
        aria-label={`Slide ${index + 1}`}
      />
    )
  }
)

const LoadingCarousel = () => (
  <div className="carousel-anime-banner relative h-[50dvh] animate-pulse bg-zinc-900 md:h-[90dvh]">
    <div className="relative flex h-full w-full flex-shrink-0 flex-col items-center px-8 py-4 md:flex-row">
      <div className="z-10 mx-auto -mt-14 flex h-full w-full max-w-2xl flex-col items-center justify-center gap-4 p-6 text-white md:mr-16 md:ml-8 md:h-auto md:items-start md:justify-normal">
        <div className="z-30 h-20 w-full animate-pulse rounded-lg bg-zinc-800 md:mt-4 md:mb-4"></div>
        <div className="z-30 hidden h-12 w-full animate-pulse rounded-lg bg-zinc-800 md:flex"></div>

        <div className="flex w-full flex-row items-center gap-4 md:mt-2">
          <div className="h-10 w-32 animate-pulse rounded-lg bg-zinc-800 md:flex"></div>
          <div className="h-10 w-32 animate-pulse rounded-lg bg-zinc-800"></div>
        </div>
      </div>
    </div>
    <div className="absolute bottom-[20%] left-1/2 z-30 flex h-6 w-52 -translate-x-1/2 animate-pulse rounded-lg bg-zinc-800 md:bottom-[5%]"></div>
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

    const newUrl = createDynamicUrl()
    setUrl(`/api/animes?${newUrl.url}&banners_filter=true`)
    sessionStorage.setItem(
      'banners-url',
      `/api/animes?${newUrl.url}&banners_filter=true`
    )
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
      className={`carousel-anime-banner relative right-0 left-0 h-[50dvh] md:h-[90dvh] ${fadeIn ? 'opacity-100 transition-all duration-200' : 'opacity-0'} `}
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
                  backgroundImage: `url(${createImageUrlProxy(anime.banner_image, '1920', '50', 'webp')})`,
                }}
              />
              <div
                className={`absolute bottom-0 h-full w-full from-transparent ${index % 2 === 0 ? 'left-0 md:bg-gradient-to-l' : 'right-0 md:bg-gradient-to-r'} to-base/70`}
              />
              <div className="to-base absolute right-0 bottom-0 left-0 h-full bg-gradient-to-b from-transparent md:h-1/2" />
              <div
                className={`mb-20 flex flex-col items-center gap-8 p-6 md:items-start md:justify-start md:gap-4 ${index % 2 === 0 ? 'md:mr-16 md:ml-8' : 'md:mr-8 md:ml-16'} z-10 max-w-2xl text-white`}
              >
                <h2 className="max-h-44 text-center text-2xl font-bold text-white drop-shadow-md md:mb-4 md:text-left md:text-5xl">
                  {reduceString(anime.title, 40)}
                </h2>
                <p className="mb-4 hidden text-xl text-white drop-shadow md:flex">
                  {reduceString(anime.synopsis, 100)}
                </p>
                <div className="mx-auto flex w-[240px] flex-row items-center gap-4 md:mx-0 md:w-80">
                  <a
                    href={`/${normalizeString(anime.title)}_${anime.mal_id}`}
                    className="button-secondary flex w-full"
                  >
                    Learn More
                  </a>
                  <WatchAnimeButton
                    url={`/watch/${normalizeString(anime.title)}_${anime.mal_id}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-[20%] left-1/2 z-30 flex -translate-x-1/2 space-x-3 md:bottom-[5%]">
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
        className="group absolute start-0 top-0 z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none md:px-8"
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
        className="group absolute end-0 top-0 z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none md:px-8"
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
