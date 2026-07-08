# ==============================================================================
# Configuration Settings (Pydantic Settings Manager)
# ==============================================================================

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "MarketMind AI ML Service"
    env: str = "development"
    host: str = "0.0.0.0"
    port: int = 8000

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
