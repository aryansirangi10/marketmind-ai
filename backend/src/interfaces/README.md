# Interfaces Layer

Exposes application capabilities via web interfaces. This layer is responsible for translating network requests to application commands and queries.

## Contents

- **HTTP**:
  - **Controllers**: Handlers for HTTP requests (e.g., `AuthController`, `PortfolioController`).
  - **Middleware**: Authentication checks, rate limiters, validation hooks, error handlers.
  - **Routes**: API route declarations and groupings.
  - **Server**: Express entrypoint.
- **WebSockets**:
  - **SocketServer**: Socket.IO initialization and socket event mapping.
  - **Handlers**: Stream price ticks, trigger notification broadcasts.
