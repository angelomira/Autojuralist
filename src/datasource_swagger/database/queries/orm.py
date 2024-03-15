from loguru import logger

from database.db import Base, async_engine


@logger.catch()
async def create_tables():
    async with async_engine.begin() as conn:
        logger.info("Creating tables...")
        try:
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Tables created successfully.")
        except Exception as e:
            logger.error(f"Error creating tables: {e}")
