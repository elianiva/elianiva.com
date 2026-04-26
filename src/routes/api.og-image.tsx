import { createFileRoute } from '@tanstack/react-router'
import { html } from 'satori-html'
import { satori } from '@cf-wasm/satori'
import { Resvg } from '@cf-wasm/resvg'

export const Route = createFileRoute('/api/og-image')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const title = url.searchParams.get('title') || "elianiva's home row"
        const description = url.searchParams.get('description') || 'Personal website and blog'

        const template = html`
          <div style="
            width: 1200px;
            height: 630px;
            background: linear-gradient(135deg, #fff1f2 0%, #fce7f3 50%, #fbcfe8 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: system-ui, -apple-system, sans-serif;
            position: relative;
            overflow: hidden;
          ">
            <div style="
              position: absolute;
              width: 300px;
              height: 300px;
              border-radius: 50%;
              background: rgba(251, 207, 232, 0.4);
              top: -100px;
              right: -100px;
            "></div>
            <div style="
              position: absolute;
              width: 200px;
              height: 200px;
              border-radius: 50%;
              background: rgba(244, 114, 182, 0.15);
              bottom: -50px;
              left: -50px;
            "></div>
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 24px;
              z-index: 1;
              padding: 60px;
              text-align: center;
            ">
              <div style="
                font-size: 72px;
                font-weight: 800;
                color: #831843;
                line-height: 1.1;
                max-width: 900px;
              ">${title}</div>
              <div style="
                font-size: 32px;
                color: #9d174d;
                max-width: 800px;
                line-height: 1.4;
              ">${description}</div>
              <div style="
                margin-top: 20px;
                font-size: 24px;
                color: #be185d;
                font-weight: 600;
              ">elianiva.com</div>
            </div>
          </div>
        `

        const svg = await satori(template, {
          width: 1200,
          height: 630,
          fonts: [],
        })

        const resvg = new Resvg(svg, {
          fitTo: {
            mode: 'width',
            value: 1200,
          },
        })

        const pngData = resvg.render()
        const pngBuffer = pngData.asPng()

        return new Response(pngBuffer.buffer as ArrayBuffer, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400',
          },
        })
      },
    },
  },
})
