# Trading Dashboard

A real-time trading dashboard with advanced visualization and analytics capabilities. Built with Next.js, TypeScript, and WebSocket for real-time market data updates.

## Features

- Real-time market data updates
- Advanced technical analysis
- Interactive charts and visualizations
- Customizable dashboard layout
- Role-based access control
- Rate limiting and caching
- Dark/light theme support

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **State Management**: Zustand
- **Data Visualization**: Recharts
- **Real-time Updates**: WebSocket
- **Caching**: Redis
- **Authentication**: JWT
- **API Integration**: Polygon.io
- **Containerization**: Docker
- **CI/CD**: GitHub Actions

## Prerequisites

- Node.js >= 18
- Docker and Docker Compose
- Redis
- Polygon.io API key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/trading-dashboard.git
   cd trading-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Update environment variables in `.env.local`:
   ```
   POLYGON_API_KEY=your-polygon-api-key
   JWT_SECRET=your-jwt-secret
   REDIS_URL=redis://localhost:6379
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## Docker Deployment

1. Build and start containers:
   ```bash
   docker-compose up -d
   ```

2. Check application status:
   ```bash
   docker-compose ps
   ```

3. View logs:
   ```bash
   docker-compose logs -f
   ```

## Testing

Run tests:
```bash
# Unit tests
npm test

# Test coverage
npm run test:coverage
```

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

## Environment Variables

Required environment variables:

- `POLYGON_API_KEY`: Your Polygon.io API key
- `JWT_SECRET`: Secret key for JWT tokens
- `REDIS_URL`: Redis connection URL
- `NODE_ENV`: Environment (development/production)
- `PORT`: Application port (default: 3000)

See `.env.example` for all available options.

## Project Structure

```
├── app/                  # Next.js app directory
├── components/          # React components
├── lib/                # Core libraries
│   ├── api/           # API clients
│   ├── services/      # Business logic
│   ├── hooks/         # React hooks
│   └── utils/         # Utilities
├── public/            # Static files
├── tests/             # Test files
└── types/             # TypeScript types
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Polygon.io](https://polygon.io/) for market data
- [Next.js](https://nextjs.org/) for the framework
- [Recharts](https://recharts.org/) for charts
- [Redis](https://redis.io/) for caching 