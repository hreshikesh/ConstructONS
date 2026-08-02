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
    # Auto-seed if any critical collection is empty. This is self-healing so
    # that a fresh production deploy (which starts with an empty DB) always
    # comes up with a complete content baseline.
    from db import db
    from seed import seed_all

    critical_collections = [
        "homes",
        "packages",
        "hero_sections",
        "site_settings",
        "financial_services",
        "marketplace_categories",
    ]
    needs_seed = False
    for coll in critical_collections:
        count = await db[coll].count_documents({})
        if count == 0:
            logger.info(f"Collection '{coll}' is empty — will trigger seed.")
            needs_seed = True
            break

    if needs_seed:
        logger.info("Seeding sample data...")
        await seed_all()
        logger.info("Seeding complete.")
    else:
        logger.info("All critical collections populated — skipping seed.")


@app.on_event("shutdown")
async def shutdown_db_client():
    from db import client
    client.close()
