# Application Layer

Coordinates the execution of use cases. It implements the business logic by coordinating domain entities and infrastructure services.

## Contents

- **Services**: Concrete business workflow orchestrators (e.g., `PortfolioService`, `AuthService`, `AnalyticsService`).
- **DTOs**: Data Transfer Objects defining data shapes sent across API bounds.
- **Mappers**: Translation objects between database schemas, entities, and DTOs.
