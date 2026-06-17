import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Fratello — GEO Platform'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          background: 'linear-gradient(160deg, #085937 0%, #03492c 60%, #022a1a 100%)',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="#ffffff" fillOpacity="0.15" />
            <g fill="white" transform="translate(5 6) scale(0.68)">
              <path d="M11 0 L2.6 13.9 L0 13.9 Z"/>
              <path d="M12 0 L20.2 13.9 L22.8 13.9 Z"/>
              <path d="M11.5 0.1 L13.3 13.9 L3.5 13.9 Z"/>
            </g>
          </svg>
          <span style={{ color: 'white', fontSize: 28, fontWeight: 600, marginLeft: 16, letterSpacing: '-0.5px' }}>
            Fratello
          </span>
        </div>

        <div style={{ color: 'white', fontSize: 64, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 24, maxWidth: 800 }}>
          Brand kamu disebut AI?
        </div>

        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 28, lineHeight: 1.4, maxWidth: 700 }}>
          Track mention rate di ChatGPT, Gemini & Perplexity. Generate konten yang menutup gap visibilitas brandmu secara otomatis.
        </div>

        <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 100, padding: '10px 20px', color: 'white', fontSize: 18 }}>
            hifratello.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
