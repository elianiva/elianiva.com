import { useRouterState } from '@tanstack/react-router'
import sites from '#/data/sites'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  thumbnail?: string
  isPost?: boolean
  publishedAt?: string
}

export function SEO({
  title,
  description = sites.description,
  keywords = sites.keywords,
  thumbnail,
  isPost = false,
  publishedAt,
}: SEOProps) {
  const state = useRouterState()
  const url = new URL(state.location.pathname, sites.siteUrl).toString()
  const fullTitle = title ? `${title} | ${sites.siteName}` : sites.siteName
  const thumb = thumbnail || new URL('/assets/thumbnail.png', sites.siteUrl).toString()

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={sites.author} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={sites.siteName} />
      <meta property="og:image" content={thumb} />
      <meta property="og:type" content={isPost ? 'article' : 'website'} />
      {isPost && publishedAt && (
        <>
          <meta property="article:published_time" content={publishedAt} />
          <meta property="article:author" content={sites.author} />
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={sites.twitter} />
      <meta name="twitter:creator" content={sites.twitter} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={thumb} />

      {/* Favicon */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    </>
  )
}
