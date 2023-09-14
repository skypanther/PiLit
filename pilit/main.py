from fastapi import FastAPI
from routes import api_router

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


# There is intentionally no security implemented at this time. PiLit is expected
# to be run from a server on your local network. In most networks (which are behind
# a NAT/firewall), this means no one outside your network can access the PiLit server.
# This may change in the future to enable a separation between show editors and consumers.

app.include_router(api_router, prefix="")
