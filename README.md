# Trading Dashboard

A modern, real-time trading dashboard built with Next.js and Polygon.io API integration. This platform provides comprehensive market analysis tools, real-time stock data, and technical indicators for informed trading decisions.

## Features

- Real-time market data streaming
- Technical analysis tools and indicators
- Interactive stock charts
- Market overview and sector analysis
- Portfolio tracking and analysis
- Customizable watchlists
- Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **Data Visualization**: Recharts, Lightweight Charts
- **Market Data**: Polygon.io API
- **State Management**: React Hooks
- **Form Handling**: React Hook Form, Zod

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Polygon.io API key

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd trading-dashboard
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory:
```env
POLYGON_API_KEY=your_polygon_api_key_here
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
# or
yarn build
```

## Deployment

This project can be deployed to various platforms:

- Vercel (Recommended)
- Netlify
- Custom server

For WordPress integration, you can:
1. Deploy the Next.js app to Vercel
2. Embed it in your WordPress site using an iframe or subdomain

## Environment Variables

Required environment variables:

- `POLYGON_API_KEY`: Your Polygon.io API key

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)

## Contact

For inquiries about investment opportunities or collaboration, please contact [Your Contact Information]. 