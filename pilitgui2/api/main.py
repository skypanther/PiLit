from fastapi import FastAPI
from routers import api_router

from database import init_db, get_db

try:
    # Try to create session to check if DB is awake
    db = get_db()
    db.execute("SELECT 1")
except Exception as e:
    init_db()

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


app.include_router(api_router, prefix="")
