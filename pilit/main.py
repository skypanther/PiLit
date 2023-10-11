from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import api_router

app = FastAPI()

origins = [
    "http://localhost:1234",
    "https://127.0.0.1:1234",
    "http://localhost",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


# There is intentionally no security implemented at this time. PiLit is expected
# to be run from a server on your local network. In most networks (which are behind
# a NAT/firewall), this means no one outside your network can access the PiLit server.
# This may change in the future to enable a separation between show editors and consumers.

app.include_router(api_router, prefix="")
