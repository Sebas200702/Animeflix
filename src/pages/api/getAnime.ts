import { redis } from '@libs/redis'
import { supabase } from '@libs/supabase'

import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ url }) => {
  try {
    if (!redis.isOpen) {
      await redis.connect()
    }
    const cachedData = await redis.get(`anime:${url.searchParams.get('slug')}`)

    if (cachedData) {
      return new Response(JSON.stringify({ anime: JSON.parse(cachedData) }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    const title_query = url.searchParams.get('slug')
    if (!title_query) {
      return new Response(
        JSON.stringify({ error: 'No title query provided' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const [, id] = title_query.split('_')
    if (!id) {
      return new Response(JSON.stringify({ error: 'Invalid slug format' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { data, error } = await supabase.rpc('get_anime_by_id', { id })

    if (error) {
      console.log(url)
      console.log(error)
      throw new Error('Error retrieving anime data')
    }

    if (!data || data.length === 0) {
      return new Response(JSON.stringify({ error: 'Anime not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await redis.set(
      `anime:${url.searchParams.get('slug')}`,
      JSON.stringify(data[0])
    )
    return new Response(JSON.stringify({ anime: data[0] }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (err) {
    if (import.meta.env.MODE === 'development') {
      console.error('Unhandled Error:', err)
    }
    return new Response(JSON.stringify({ error: 'Ups something went wrong' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
