import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ request, url }) => {
  const resourceUrl = url.searchParams.get('url')

  if (!resourceUrl) {
    return new Response('Missing resource URL', { status: 400 })
  }

  try {
    const response = await fetch(resourceUrl)

    if (!response.ok) {
      return new Response('Error fetching the resource', { status: response.status })
    }

    // Si el recurso es un archivo .m3u8, hacer una modificación en el contenido
    if (resourceUrl.endsWith('.m3u8')) {
      const originalText = await response.text()

      // Modificar las URLs dentro del archivo .m3u8, específicamente las de los archivos .ts
      const modifiedText = originalText.replace(
        /(^(?!https?:\/\/)[^\s#]+\.ts)/gm,
        (match) => `${url.origin}/api/videoProxy?url=${encodeURIComponent(resourceUrl.replace(/[^/]+$/, '') + match)}`
      )

      return new Response(modifiedText, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
        },
      })
    }

    // Si no es un archivo .m3u8 (por ejemplo, segmentos .ts), simplemente retransmitir los datos
    const contentType = response.headers.get('Content-Type') || 'application/octet-stream'
    const readableStream = response.body

    if (readableStream) {
      const stream = new ReadableStream({
        start(controller) {
          const reader = readableStream.getReader()

          function push() {
            reader.read().then(({ done, value }) => {
              if (done) {
                controller.close()
                return
              }
              controller.enqueue(value)
              push()
            })
          }

          push()
        },
      })

      return new Response(stream, {
        status: response.status,
        headers: { 'Content-Type': contentType },
      })
    }

    // Si no hay cuerpo (contenido vacío)
    return new Response('No content', { status: 204 })
  } catch (error) {
    console.error('Proxy error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}