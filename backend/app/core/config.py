from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    PROJECT_NAME: str = "InframeSH"
    VERSION: str = "2.4.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Host
    ENVIRONMENT: str = "production-us-east-1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    
    # Security & Auth
    SECRET_KEY: str = "inframesh_super_secret_jwt_key_securerandom_32_chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    ALGORITHM: str = "HS256"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./inframesh.db"
    
    # Redis
    REDIS_URL: Optional[str] = None
    
    # Observability
    PROMETHEUS_URL: str = "http://localhost:9090"
    LOKI_URL: str = "http://localhost:3100"
    JAEGER_URL: str = "http://localhost:16686"
    
    # Data Retention Settings (in days/hours)
    METRIC_RETENTION_HOURS: int = 72
    LOG_RETENTION_DAYS: int = 14
    TRACE_RETENTION_DAYS: int = 7
    INCIDENT_RETENTION_DAYS: int = 90
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]

settings = Settings()
