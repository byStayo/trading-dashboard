# API Overload Mitigation Runbook

This document outlines a step-by-step plan for mitigating the overload of API requests that are threatening to saturate the system. The goal is to reduce redundant and excessive calls while ensuring that clients receive timely market data responses. 

---

## 1. Overview

Our system is experiencing a massive number of incoming requests (hundreds of thousands in rapid succession), especially via the market data endpoints. This high request rate can overwhelm the API, degrade performance, and potentially cause downtime. This runbook provides instructions for investigating and resolving this problem.

---

## 2. Analysis and Codebase Review

### 2.1. Identified Components

- **Market Data Subscription**: The `useMarketDataStore` and `useMarketData` hook subscribe clients to market data updates. Each subscription in turn triggers API requests via the `MarketDataClient` (in `lib/services/market-data-client.ts`).

- **Caching Layer**: A simple in-memory caching mechanism is implemented in `CacheManager` (in `lib/utils/cache-manager.ts`) and used in `MarketDataClient` to cache responses. However, the caching strategy might be insufficient for high load scenarios.

- **Rate Limiting**: A `RateLimiter` (in `lib/services/rate-limiter.ts`) is provided to limit request rates. Default settings (e.g., 60 requests per 60 seconds for API) may be too lenient for the current demand. 

- **Metrics and Logging**: The system uses a custom metrics implementation which logs high-frequency events but may not be filtering or throttling requests at the API gateway level.

### 2.2. Potential Problems

- **Burst Traffic**: The subscription model may lead to duplicate requests, as multiple client components may subscribe to the same symbol simultaneously.

- **Inefficient Caching**: In-memory caching may not scale sufficiently in a distributed environment. There is no throttling of outbound API calls if the cache is missed.

- **Rate Limiter Configuration**: The current rate limiting defaults may be too high to prevent overload. The system needs stricter controls and potentially a distributed rate-limiter (e.g., using Redis).

- **WebSocket Connection Handling**: Repeated reconnections and rapid WebSocket subscription requests may further exacerbate the load on the API.

---

## 3. Proposed Actions

### 3.1. Enhance Rate Limiting

- **Review and Adjust Defaults**: Lower the default threshold for API calls in `RateLimiter` (e.g., reduce from 60 points to a lower value).

- **Distributed Rate Limiting**: Consider moving from an in-memory cache to a distributed system (e.g., Redis) to handle rate limits in a clustered environment.

### 3.2. Improve Caching Strategy

- **Upgrade Caching**: Replace or supplement the current in-memory `CacheManager` with a more robust caching solution (Redis or Memcached) to serve requests quickly under heavy load.

- **Aggressive Cache Revalidation**: Increase TTL for frequently requested market data and introduce background cache refresh mechanisms.

### 3.3. Debounce Duplicate Subscription Requests

- **Batch Incoming Requests**: Modify the subscription logic in `useMarketDataStore` and `useMarketData` to coalesce duplicate subscription requests for the same symbol.

- **Debounce Function Calls**: Implement a debounce or throttle function when clients invalidate or subscribe to data, reducing the number of calls to the API.

### 3.4. Improve WebSocket and REST API Integration

- **Optimize WebSocket Handling**: Ensure that the WebSocket connections are maintained, and subscriptions are managed in a way that minimizes redundant REST API fetches.

- **Fallback Mechanisms**: Introduce a back-off mechanism for re-subscriptions if the API shows signs of heavy load.

### 3.5. Monitoring and Alerting

- **Enhanced Metrics**: Use the existing metrics system to set up alerts for anomalously high request rates.

- **Logging Enhancements**: Increase logging around rate limiter hits and cache misses to quickly identify problematic traffic patterns.

---

## 4. Implementation Steps

1. **Review Rate Limiter Settings (lib/services/rate-limiter.ts):**
   - Audit the default values for API and WebSocket limits.
   - Reduce request thresholds and/or block durations as needed for your environment.

2. **Upgrade Caching Layer (lib/utils/cache-manager.ts):**
   - Investigate integrating Redis for caching market data responses.
   - Test the integration in a staging environment to ensure that cache hits are improved under load.

3. **Debounce Subscription Logic (lib/store/market-data-store.ts & lib/hooks/use-market-data.ts):**
   - Implement debouncing or batching of duplicate subscription requests.
   - Ensure that when multiple requests for the same symbol occur in a short time span, only one API call is made.

4. **Enhance WebSocket Management (lib/services/market-data-client.ts):**
   - Optimize the subscribe/unsubscribe logic to avoid unnecessary re-subscriptions.
   - Introduce error handling that gracefully backs off if the WebSocket is overloaded.

5. **Monitor and Alert (Metrics and Logging):**
   - Configure alerts based on the metrics collected (e.g., high rate limit block counts, excessive cache misses).
   - Use these alerts to dynamically adjust thresholds and identify when the system is under stress.

6. **Load Testing:**
   - Simulate high request volumes in a staging environment to validate that the changes reduce API load.
   - Document results and adjust parameters as necessary.

7. **Documentation and Review:**
   - Update internal documentation to reflect the new rate limiter settings, caching approach, and subscription batching.
   - Perform a code review session to ensure all changes are merged and deployed safely.

---

## 5. Testing and Verification

- **Load Testing:** Run simulations to ensure that under heavy load, the API response times remain within acceptable limits.

- **Monitoring:** Check the metrics dashboard for rate limit blocks, cache hits/misses, and API call counts.

- **User Feedback:** Verify that clients still receive timely market data updates without overwhelming the backend.

---

## 6. Fallback and Rollback Procedures

- In case the new rate limiter or caching strategy negatively impacts service quality, have a documented rollback plan to revert to the previous configurations.

- Ensure that feature toggles are in place to disable the aggressive rate limiting if unforeseen issues arise.

---

## 7. Conclusion

Following these detailed instructions should help mitigate the API overload issues and ensure stable performance even under high load. Continuous monitoring, testing, and refinement of these strategies will be critical in maintaining system health.

---

*This document is to be used by the agent responsible for implementing and maintaining the mitigation measures. Please review and update periodically.* 