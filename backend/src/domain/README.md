# Domain Layer

The core of the application containing the business domain. It is completely independent of other layers (frameworks, database, etc.).

## Contents

- **Entities**: Business models (e.g., User, Asset, Portfolio).
- **Value Objects**: Objects defined by their attributes rather than a thread of identity.
- **Interfaces**: Definitions of repositories, service interfaces, and third-party API providers (e.g., `IFinnhubProvider`, `ICoinGeckoProvider`).
- **Exceptions**: Domain-specific errors.
