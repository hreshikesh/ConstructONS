from contextlib import asynccontextmanager
import os
import logging
from pathlib import Path
from fastapi import FastAPI
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from routes import router as api_router  # noqa: E402
from project_routes import proj_router  # noqa: E402

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- STARTUP LOGIC ---
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

    # Initialize Emergent Object Storage session key
    try:
        from media_service import init_storage
        init_storage()
    except Exception as e:
        logger.warning(f"Object storage init deferred: {e}")

    # Seed the first admin user in the DB
    try:
        from auth import ensure_admin_seeded
        await ensure_admin_seeded()
        logger.info("Admin user seed check complete.")
    except Exception as e:
        logger.error(f"Admin seed failed: {e}")

    # Seed the Interior Library starter catalog if empty
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

    yield  # Server runs while execution pauses here

    # --- SHUTDOWN LOGIC ---
    from db import client
    client.close()


app = FastAPI(
    title="ConstructONS CMS API",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(api_router)
app.include_router(proj_router)

# --- CORS CONFIGURATION ---
# Parse CORS_ORIGINS or CORS from environment
raw_cors = os.environ.get('CORS_ORIGINS', os.environ.get('CORS', '*'))

# Browsers reject allow_credentials=True if origin is '*'.
# Convert '*' to explicit local defaults, or split comma-separated origins.
if raw_cors.strip() == '*':
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://construct-hkc240trg-hreshikeshs-projects.vercel.app"
    ]
else:
    origins = [origin.strip() for origin in raw_cors.split(',') if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)