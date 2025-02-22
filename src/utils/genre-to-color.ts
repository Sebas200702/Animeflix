import { AnimeGenres } from 'types'

export const genreToColor = (genre: string) => {
  if (genre === AnimeGenres.ACTION) return 'md:group-hover:text-red-400'
  if (genre === AnimeGenres.ADVENTURE) return 'md:group-hover:text-enfasisColor'
  if (genre === AnimeGenres.GIRLS_LOVE) return 'md:group-hover:text-purple-200'
  if (genre === AnimeGenres.COMEDY) return 'md:group-hover:text-yellow-400'
  if (genre === AnimeGenres.DRAMA) return 'md:group-hover:text-purple-800'
  if (genre === AnimeGenres.ROMANCE) return 'md:group-hover:text-pink-400'
  if (genre === AnimeGenres.SCI_FI) return 'md:group-hover:text-indigo-400'
  if (genre === AnimeGenres.SLICE_OF_LIFE) return 'md:grouphover:text-green-400'
  if (genre === AnimeGenres.SPORTS) return 'md:group-hover:text-orange-400'
  if (genre === AnimeGenres.FANTASY) return 'md:group-hover:text-pink-600'
  if (genre === AnimeGenres.MYSTERY) return 'md:group-hover:text-yellow-200'
  if (genre === AnimeGenres.SCI_FI) return 'md:group-hover:text-slate-400'
  return 'md:group-hover:text-gray-400'
}
