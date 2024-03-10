from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr
from loguru import logger


class EnvBaseSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


class SecretKey(EnvBaseSettings):
    TOKEN_SECRET_KEY: SecretStr


class DBSettings(EnvBaseSettings):
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASS: SecretStr
    DB_NAME: str

    @property
    def DATABASE_URL_asyncpg(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASS.get_secret_value()}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


# class CacheSettings(EnvBaseSettings):
#     REDIS_HOST: str
#     REDIS_PORT: int
#     REDIS_PASS: str | None = None
#     REDIS_DB: int


class Settings(DBSettings, SecretKey):
    DEBUG: bool = False


settings = Settings()
