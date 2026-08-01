from fastapi import FastAPI
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from routes import router as api_router  # noqa: E402

app = FastAPI(title="ConstructONS CMS API", version="1.0.0")
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_event():
    # Auto-seed if empty
    from db import db
    from seed import seed_all
    homes_count = await db.homes.count_documents({})
    if homes_count == 0:
        logger.info("Empty database detected. Seeding sample data...")
        await seed_all()
        logger.info("Seeding complete.")


@app.on_event("shutdown")
async def shutdown_db_client():
    from db import client
    client.close()
