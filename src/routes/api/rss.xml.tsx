import { createFileRoute } from '@tanstack/react-router'
import { allPosts, allProjects } from 'content-collections'
import sites from '#/data/sites'

export const Route = createFileRoute('/api/rss/xml')({
  server: {
    handlers: {
      GET: async () => {
        const posts = allPosts.filter((p) => !p.draft).sort((a, b) => (a.date > b.date ? -1 : 1))
        const projects = allProjects.sort((a, b) => (a.date > b.date ? -1 : 1))
        const items = [
          ...posts.map((post) => ({ title: post.title, url: sites.siteUrl + '/posts/' + post.slug, date: post.date, description: post.description })),
          ...projects.map((project) => ({ title: project.title, url: sites.siteUrl + '/projects/' + project.slug, date: project.date, description: project.description })),
        ]
        const xml = '<?xml version="1.0" encoding="UTF-8"?>' +
          '<rss version="2.0"><channel>' +
          '<title>' + sites.siteName + '</title><link>' + sites.siteUrl + '</link><description>' + sites.description + '</description>' +
          items.map((item) => '<item><title>' + item.title + '</title><link>' + item.url + '</link><guid>' + item.url + '</guid><pubDate>' + new Date(item.date).toUTCString() + '</pubDate><description>' + item.description + '</description></item>').join('') +
          '</channel></rss>'
        return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } })
      }
    }
  }
})