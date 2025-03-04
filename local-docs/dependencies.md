# Documentation

## Trading Dashboard Repository

### 1. Repository Purpose and Summary

This repository contains a packed representation of the entire codebase for a trading dashboard. It is designed for AI systems to analyze and understand the project structure and contents. This documentation provides a summary of the repository, usage guidelines, and directory structure.

### 2. Quick Start

To run this project locally:

1.  Install dependencies:

    ```bash
    npm install
    ```
2.  Start the development server:

    ```bash
    npm run dev
    ```
    The dashboard will be accessible at `http://localhost:3000`.

### 3. Configuration Options

The application uses the following environment variables for configuration:

-   `POLYGON_API_KEY`: API key for Polygon.io for market data.
-   `JWT_SECRET`: Secret key for JWT authentication.
-   `REDIS_URL`: Connection URL for Redis caching.

These variables are configured in `.env.local` for local development and in your hosting environment for production.

### 4. Repository Features and API Documentation

This repository implements a comprehensive trading dashboard with the following features and APIs:

#### 4.1. AI Market Researcher (`/app/ai-researcher`)

-   **Purpose**: Provides an AI-powered market research dashboard.
-   **Page**: `app/ai-researcher/page.tsx`
-   **Components**:
    -   `AIResearcherDashboard`: Main dashboard component.
    -   `MacroIndicator`: Displays key macroeconomic indicators.
    -   `ResearchReport`: Renders AI-generated research reports.
    -   `RiskAssessment`: Visualizes market risk assessments.
    -   `TrendAnalysis`: Shows trend analysis data.

#### 4.2. Chat API (`/app/api/chat/route.ts`)

-   **Endpoint**: `/api/chat`
-   **Method**: `POST`
-   **Purpose**:  Provides a chat interface powered by OpenAI to get weather information using the `getWeather` tool.
-   **Request Body**:
    ```json
    {
      "messages": [
        { "role": "user", "content": "What's the weather in London?" }
      ]
    }
    ```
-   **Response**:  Returns a stream of text as server-sent events.

#### 4.3. Company API (`/app/api/company/route.ts`)

-   **Endpoint**: `/app/api/company`
-   **Method**: `GET`
-   **Purpose**: Retrieves company details for a given stock symbol from Polygon.io.
-   **Query Parameters**:
    -   `symbol`: Stock ticker symbol (e.g., AAPL).
-   **Response**: Returns company information in JSON format.

-   **Endpoint**: `/app/api/company`
-   **Method**: `POST`
-   **Purpose**: Retrieves company details for multiple stock symbols in batch from Polygon.io.
-   **Request Body**:
    ```json
    {
      "symbols": ["AAPL", "MSFT", "GOOGL"]
    }
    ```
-   **Response**: Returns a JSON object with company information for each symbol.

#### 4.4. Generate Chart Data API (`/app/api/generate/route.ts`)

-   **Endpoint**: `/app/api/generate`
-   **Method**: `POST`
-   **Purpose**: Generates chart data and configurations using OpenAI based on a user prompt.
-   **Request Body**:
    ```json
    {
      "prompt": "Generate a line chart of AAPL stock price for the last year"
    }
    ```
-   **Response**: Returns chart data in JSON format.

#### 4.5. Generate Market Insights API (`/app/api/generate-insights/route.ts`)

-   **Endpoint**: `/app/api/generate-insights`
-   **Method**: `POST`
-   **Purpose**: Generates market insights using OpenAI based on user prompts.
-   **Request Body**:
    ```json
    {
      "prompt": "Provide insights on the technology sector"
    }
    ```
-   **Response**: Returns a stream of text as server-sent events providing market insights.

#### 4.6. Generate News API (`/app/api/generate-news/route.ts`)

-   **Endpoint**: `/app/api/generate-news`
-   **Method**: `POST`
-   **Purpose**: Generates financial news updates using OpenAI.
-   **Request Body**:
    ```json
    {
      "prompt": "Current market news"
    }
    ```
-   **Response**: Returns a stream of text as server-sent events with market news updates.

#### 4.7. Generate Trade Ideas API (`/app/api/generate-trades/route.ts`)

-   **Endpoint**: `/app/api/generate-trades`
-   **Method**: `POST`
-   **Purpose**: Generates trade suggestions using OpenAI based on market analysis.
-   **Request Body**:
    ```json
    {
      "prompt": "Suggest a trade idea for AAPL"
    }
    ```
-   **Response**: Returns a stream of text as server-sent events providing trade suggestions.

#### 4.8. Generate Visualization API (`/app/api/generate-visualization/route.ts`)

-   **Endpoint**: `/app/api/generate-visualization`
-   **Method**: `POST`
-   **Purpose**: Generates data visualization configurations using OpenAI based on user requests.
-   **Request Body**:
    ```json
    {
      "prompt": "Visualize the correlation between stock price and trading volume"
    }
    ```
-   **Response**: Returns a stream of text as server-sent events with visualization configurations.

#### 4.9. Health Check API (`/app/api/health/route.ts`)

-   **Endpoint**: `/app/api/health`
-   **Method**: `GET`
-   **Purpose**: Provides the health status of the application and its services (Redis, API).
-   **Response**: Returns a JSON object with health status, timestamp, version, service statuses, and metrics.

#### 4.10. Market Chat API (`/app/api/market-chat/route.ts`)

-   **Endpoint**: `/app/api/market-chat`
-   **Method**: `POST`
-   **Purpose**: Provides a chat interface for market analysis and insights using OpenAI.
-   **Request Body**:
    ```json
    {
      "messages": [
        { "role": "user", "content": "Analyze the current market trends." }
      ]
    }
    ```
-   **Response**: Returns a stream of text as server-sent events providing market analysis and insights.

#### 4.11. Market Data API (`/app/api/market-data/route.ts`)

-   **Endpoint**: `/app/api/market-data`
-   **Method**: `GET`
-   **Purpose**: Retrieves real-time market data snapshots for multiple stock symbols from Polygon.io. Supports pagination.
-   **Query Parameters**:
    -   `symbols`: Comma-separated list of stock ticker symbols.
    -   `page` (optional): Page number for pagination.
    -   `limit` (optional): Number of results per page.
-   **Response**: Returns paginated market data in JSON format.

-   **Endpoint**: `/app/api/market-data`
-   **Method**: `POST`
-   **Purpose**: Retrieves real-time market data snapshots for multiple stock symbols from Polygon.io using POST request for potentially larger payloads. Supports pagination in request body.
-   **Request Body**:
    ```json
    {
      "symbols": ["AAPL", "MSFT", "GOOGL"],
      "page": 1,
      "limit": 10
    }
    ```
-   **Response**: Returns paginated market data in JSON format.

#### 4.12. Market Updates API (`/app/api/market-updates/route.ts`)

-   **Endpoint**: `/app/api/market-updates`
-   **Method**: `POST`
-   **Purpose**: Generates market updates using OpenAI.
-   **Request Body**:
    ```json
    {
      "messages": [
        { "role": "user", "content": "Provide a brief market update." }
      ]
    }
    ```
-   **Response**: Returns a stream of text as server-sent events providing market updates.

#### 4.13. News API (`/app/api/news/route.ts`)

-   **Endpoint**: `/app/api/news`
-   **Method**: `GET`
-   **Purpose**: Retrieves market news articles from Polygon.io, optionally filtered by stock symbols. Supports pagination.
-   **Query Parameters**:
    -   `symbols` (optional): Comma-separated list of stock ticker symbols to filter news by.
    -   `limit` (optional): Number of news items per page.
    -   `page` (optional): Page number for pagination.
-   **Response**: Returns paginated news articles in JSON format.

-   **Endpoint**: `/app/api/news`
-   **Method**: `POST`
-   **Purpose**: Provides a streaming endpoint for real-time news updates using server-sent events.
-   **Request Body**:
    ```json
    {
      "symbols": ["AAPL", "MSFT", "GOOGL"],
      "limit": 10
    }
    ```
-   **Response**: Returns a stream of server-sent events with news updates, including initial batch and subsequent updates.

#### 4.14. Polygon Aggregates API (`/app/api/polygon/aggregates/route.ts`)

-   **Endpoint**: `/app/api/polygon/aggregates`
-   **Method**: `GET`
-   **Purpose**: Retrieves aggregate bars (OHLCV data) for a given stock ticker symbol from Polygon.io.
-   **Query Parameters**:
    -   `ticker`: Stock ticker symbol.
    -   `multiplier`: Size of the timespan multiplier.
    -   `timespan`: Time window size (minute, hour, day, week, month, quarter, year).
    -   `from`: Start date in YYYY-MM-DD format.
    -   `to`: End date in YYYY-MM-DD format.
    -   `adjusted` (optional): Whether to adjust results for splits (default: true).
-   **Response**: Returns aggregate bars data in JSON format.

#### 4.15. Polygon News API (`/app/api/polygon-news/route.ts`)

-   **Endpoint**: `/app/api/polygon-news`
-   **Method**: `GET`
-   **Purpose**: Retrieves the latest market news article from Polygon.io.
-   **Response**: Returns a single news article in JSON format.

#### 4.16. Polygon Stocks Batch API (`/app/api/polygon-stocks/batch/route.ts`)

-   **Endpoint**: `/app/api/polygon-stocks/batch`
-   **Method**: `GET`
-   **Purpose**: Retrieves snapshot data in batch for multiple stock symbols from Polygon.io.
-   **Query Parameters**:
    -   `symbols`: Comma-separated list of stock ticker symbols (max 50).
-   **Response**: Returns transformed snapshot data for each symbol in JSON format.

#### 4.17. Polygon Stocks Market Sectors API (`/app/api/polygon-stocks/market/sectors/route.ts`)

-   **Endpoint**: `/app/api/polygon-stocks/market/sectors`
-   **Method**: `GET`
-   **Purpose**: Retrieves market data for sector ETFs from Polygon.io.
-   **Response**: Returns sector performance data and market breadth metrics in JSON format.

#### 4.18. Polygon Stocks Market Overview API (`/app/api/polygon-stocks/market/route.ts`)

-   **Endpoint**: `/app/api/polygon-stocks/market`
-   **Method**: `GET`
-   **Purpose**: Retrieves comprehensive market overview data including indices, top gainers/losers, most active stocks, and sector performance from Polygon.io.
-   **Response**: Returns market data in JSON format.

#### 4.19. Polygon Stocks Test API (`/app/api/polygon-stocks/test/route.ts`)

-   **Endpoint**: `/app/api/polygon-stocks/test`
-   **Method**: `GET`
-   **Purpose**: Tests the Polygon.io API key by making a simple API call.
-   **Response**: Returns a JSON object indicating API key status and sample data.

#### 4.20. Polygon Stocks WebSocket API (`/app/api/polygon-stocks/websocket/route.ts`)

-   **Endpoint**: `/app/api/polygon-stocks/websocket`
-   **Method**: `GET`
-   **Purpose**: Provides WebSocket connection details for Polygon.io's delayed stocks WebSocket.
-   **Response**: Returns WebSocket URL and token in JSON format.

#### 4.21. Polygon Stocks Ticker Data API (`/app/api/polygon-stocks/route.ts`)

-   **Endpoint**: `/app/api/polygon-stocks`
-   **Method**: `GET`
-   **Purpose**: Retrieves detailed data for a single stock ticker symbol from Polygon.io, including previous close, daily open/close, and current aggregates.
-   **Query Parameters**:
    -   `ticker`: Stock ticker symbol.
-   **Response**: Returns detailed stock data in JSON format.

#### 4.22. Search API (`/app/api/search/route.ts`)

-   **Endpoint**: `/app/api/search`
-   **Method**: `GET`
-   **Purpose**: Searches for tickers based on a query string using Polygon.io. Supports filtering and pagination.
-   **Query Parameters**:
    -   `query`: Search string.
    -   `limit` (optional): Number of results per page.
    -   `type` (optional): Filter by asset type (stocks, crypto, forex).
    -   `market` (optional): Filter by market (stocks, crypto, fx).
    -   `active` (optional): Filter for active tickers (true/false).
-   **Response**: Returns paginated search results in JSON format.

-   **Endpoint**: `/app/api/search`
-   **Method**: `POST`
-   **Purpose**: Advanced search for tickers with flexible filters using Polygon.io.
-   **Request Body**:
    ```json
    {
      "query": "search query",
      "limit": 10,
      "type": "stocks",
      "market": "stocks",
      "active": true,
      "filters": {
        "market_cap": { "min": 1000000000 }
      }
    }
    ```
-   **Response**: Returns paginated search results in JSON format.

#### 4.23. Stock Previous Day Data API (`/app/api/stock/prev/[symbol]/route.ts`)

-   **Endpoint**: `/app/api/stock/prev/[symbol]`
-   **Method**: `GET`
-   **Purpose**: Retrieves the previous day's data for a specific stock symbol from Polygon.io.
-   **Path Parameters**:
    -   `symbol`: Stock ticker symbol.
-   **Response**: Returns previous day's data in JSON format.

#### 4.24. Stock Quote API (`/app/api/stock/quote/[symbol]/route.ts`)

-   **Endpoint**: `/app/api/stock/quote/[symbol]`
-   **Method**: `GET`
-   **Purpose**: Retrieves real-time quote for a specific stock symbol from Polygon.io.
-   **Path Parameters**:
    -   `symbol`: Stock ticker symbol.
-   **Response**: Returns real-time quote data in JSON format.

#### 4.25. Stock Tickers by Preset API (`/app/api/stock/tickers/[preset]/route.ts`)

-   **Endpoint**: `/app/api/stock/tickers/[preset]`
-   **Method**: `GET`
-   **Purpose**: Retrieves lists of stock tickers based on predefined presets (trending, sector, custom) from Polygon.io.
-   **Path Parameters**:
    -   `preset`: Preset type (trending, sector, custom).
-   **Query Parameters**:
    -   `sector` (optional, for 'sector' preset): Sector name.
    -   `tickers` (optional, for 'custom' preset): Comma-separated list of tickers.
-   **Response**: Returns a list of tickers in JSON format.

#### 4.26. Stock Trending Tickers API (`/app/api/stock/tickers/trending/route.ts`)

-   **Endpoint**: `/app/api/stock/tickers/trending`
-   **Method**: `GET`
-   **Purpose**: Retrieves a list of trending stock tickers.
-   **Response**: Returns a list of trending stock symbols in JSON format.

#### 4.27. Technical Analysis API (`/app/api/technical/route.ts`)

-   **Endpoint**: `/app/api/technical`
-   **Method**: `POST`
-   **Purpose**: Retrieves technical indicator data (SMA, RSI) for a stock symbol from Polygon.io.
-   **Request Body**:
    ```json
    {
      "symbol": "AAPL",
      "indicator": "SMA",
      "period": 20,
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD"
    }
    ```
-   **Response**: Returns technical indicator data in JSON format.

-   **Endpoint**: `/app/api/technical`
-   **Method**: `GET`
-   **Purpose**: Retrieves predefined set of technical indicators (SMA 20, 50, 200, RSI 14) for a stock symbol from Polygon.io.
-   **Query Parameters**:
    -   `symbol`: Stock ticker symbol.
-   **Response**: Returns predefined technical indicator data in JSON format.

### 5. Dependencies and Requirements

-   Next.js
-   React
-   TypeScript
-   ioredis
-   axios
-   lucide-react
-   tailwind-merge
-   tailwindcss-animate
-   class-variance-authority
-   clsx
-   react-hook-form
-   zod
-   recharts
-   zustand
-   jose
-   nanoid
-   limiter
-   winston
-   eventsource3
-   react-day-picker
-   @radix-ui/react-*
-   react-resizable-panels
-   embla-carousel-react
-   react-use-measure

### 6. Advanced Usage Examples

#### AI-Powered Features
- **AI Market Researcher:** Leverages OpenAI to provide comprehensive market analysis, risk assessments, and research reports.
- **Generative UI Components:** Utilizes OpenAI to dynamically generate charts, market insights, trade suggestions, and news updates, offering a personalized and interactive user experience.
- **AI-Enhanced Due Diligence:** Integrates AI to provide in-depth company analysis, including financial statement analysis, earnings call insights, and sentiment analysis.

#### Real-time Data Streaming
- **Live Market Data:** Implements WebSocket for real-time updates of stock prices and market data, ensuring users have access to the most current information.
- **Generative News Updates:** Streams real-time market news updates, providing immediate insights into market-moving events.
- **Polygon Ticker Wall:** Showcases real-time stock data updates in a dynamic ticker wall, offering a visual overview of market movements.

#### Portfolio Optimization and Analytics
- **Portfolio Optimizer Dashboard:** Offers AI-driven portfolio optimization strategies, allowing users to adjust risk tolerance and rebalance frequency for tailored portfolio management.
- **Portfolio Analytics Dashboard:** Provides detailed portfolio analytics, including performance analysis, benchmark comparisons, ESG scoring, and AI-generated recommendations for portfolio improvement.
- **Backtesting Dashboard:** Enables users to backtest trading strategies, optimizing parameters and evaluating performance metrics for informed trading decisions.

#### Enhanced UI and User Experience
- **Draggable Grid Layout:** Allows users to customize their dashboard layout by dragging and rearranging widgets, personalizing their workspace.
- **Context-Aware Charts:** Generates dynamic and contextually relevant charts based on user queries, enhancing data visualization and analysis.
- **Universal Clock:** Displays real-time market session timings across different global exchanges, aiding in timely trading decisions.

This documentation provides a starting point for users and developers to understand the features, architecture, and usage of the Trading Dashboard repository. For more detailed information and specific implementation guidelines, please refer to the linked documents and code comments within the repository.