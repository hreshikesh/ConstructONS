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
from project_routes import proj_router  # noqa: E402
app.include_router(proj_router)

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

    # Initialise Emergent Object Storage session key once at startup.
    try:
        from media_service import init_storage
        init_storage()
    except Exception as e:
        logger.warning(f"Object storage init deferred: {e}")

    # Seed the first admin user in the DB if the admin_users collection is empty.
    # This is what makes credentials survive future re-deploys — after the first
    # boot, credentials live in Mongo, not in the .env file. Users can rotate
    # them anytime via a future "change password" screen without touching env.
    try:
        from auth import ensure_admin_seeded
        await ensure_admin_seeded()
        logger.info("Admin user seed check complete.")
    except Exception as e:
        logger.error(f"Admin seed failed: {e}")

    # Seed the Interior Library starter catalog if empty.
    try:
        count = await db.interior_library.count_documents({})
        if count == 0:
            from interior_library_seed import INTERIOR_LIBRARY_STARTER
            from models import InteriorLibraryItem
            docs = []
            for item in INTERIOR_LIBRARY_STARTER:
                obj = InteriorLibraryItem(**item).model_dump()
                docs.append(obj)
            if docs:
                await db.interior_library.insert_many(docs)
                logger.info(f"Interior library seeded with {len(docs)} items.")
    except Exception as e:
        logger.error(f"Interior library seed failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    from db import client
    client.close()
