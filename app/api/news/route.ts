import { NextRequest } from 'next/server';
import { polygonService } from '@/lib/api/polygon-service';
import { authMiddleware } from '@/lib/middleware/auth';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';
import { errorHandler } from '@/lib/middleware/error-handler';
import { validateQueryParams } from '@/lib/utils/request-validator';
import { NewsRequestSchema } from '@/lib/utils/request-validator';
import { formatPaginatedResponse } from '@/lib/utils/response-formatter';

export async function GET(req: NextRequest) {
  try {
    // Apply middleware
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) return authResponse;

    const rateLimitResponse = await rateLimitMiddleware(req);
    if (rateLimitResponse.status !== 200) return rateLimitResponse;

    // Validate query parameters
    const query = validateQueryParams(req.nextUrl.searchParams, NewsRequestSchema);

    // Get news from service
    const newsData = await polygonService.getMarketNews(
      query.symbols?.join(','),
      query.limit
    );

    // Format response with pagination
    return formatPaginatedResponse(
      newsData,
      {
        page: query.page || 1,
        limit: query.limit || 10,
        total: newsData.length,
        totalPages: Math.ceil(newsData.length / (query.limit || 10)),
      },
      {
        source: 'polygon',
        cached: true,
      }
    );
  } catch (error) {
    return errorHandler(error, req);
  }
}

// Streaming endpoint for real-time news updates
export async function POST(req: NextRequest) {
  try {
    // Apply middleware
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) return authResponse;

    const rateLimitResponse = await rateLimitMiddleware(req);
    if (rateLimitResponse.status !== 200) return rateLimitResponse;

    // Validate request body
    const body = await req.json();
    const validatedData = NewsRequestSchema.parse(body);

    // Create a readable stream for news updates
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Initial news fetch
          const initialNews = await polygonService.getMarketNews(
            validatedData.symbols?.join(','),
            validatedData.limit
          );

          // Send initial batch
          controller.enqueue(
            `data: ${JSON.stringify({
              type: 'initial',
              data: initialNews,
            })}\n\n`
          );

          // Set up polling for updates
          const pollInterval = setInterval(async () => {
            try {
              const latestNews = await polygonService.getMarketNews(
                validatedData.symbols?.join(','),
                validatedData.limit
              );

              // Filter out news we've already sent
              const newItems = latestNews.filter(
                item => !initialNews.some(existing => existing.id === item.id)
              );

              if (newItems.length > 0) {
                controller.enqueue(
                  `data: ${JSON.stringify({
                    type: 'update',
                    data: newItems,
                  })}\n\n`
                );
              }
            } catch (error) {
              console.error('News polling error:', error);
              controller.error(error);
            }
          }, 60000); // Poll every minute

          // Clean up on close
          return () => {
            clearInterval(pollInterval);
          };
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return errorHandler(error, req);
  }
} 