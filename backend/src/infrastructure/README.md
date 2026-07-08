# Infrastructure Layer

Implements details that support the application and domain layers, such as database repositories, cache management, and concrete API provider adapters.

## Contents

- **Database**: Prisma Client implementation, DB repositories.
- **Cache**: Redis implementation for caching and queues.
- **Providers**: Concrete implementations of external stock, crypto, news, and AI adapters (e.g., `FinnhubProvider`, `GeminiProvider`).
- **Config**: Application configuration loading and environment verification.
- **Logger**: Logging infrastructure using Pino.
