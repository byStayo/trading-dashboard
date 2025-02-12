import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.POLYGON_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Polygon API key not set" }, { status: 500 })
  }

  const url = `https://api.polygon.io/v2/reference/news?limit=1&apiKey=${apiKey}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      return NextResponse.json({ error: "Error fetching news" }, { status: response.status })
    }
    const data = await response.json()
    const newsArticle = data.results?.[0] || null

    if (!newsArticle) {
      return NextResponse.json({ error: "No news found" }, { status: 404 })
    }

    return NextResponse.json({
      id: newsArticle.id || newsArticle.published_utc,
      headline: newsArticle.title,
      summary: newsArticle.article_url ? newsArticle.article_url : newsArticle.description,
      source: newsArticle.source,
      publishedUtc: newsArticle.published_utc,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

