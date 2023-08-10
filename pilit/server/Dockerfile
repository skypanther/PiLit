FROM python:3.11-slim-bookworm

WORKDIR /app

# Set environment variables
ENV PYTHONPATH=/app
COPY ./.env .
RUN export $(xargs <.env)

# Install PGSQL
RUN apt update && apt install -y postgresql postgresql-contrib

EXPOSE 8000
EXPOSE 5432

COPY . /app
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]
uvicorn main:app --host 0.0.0.0 --port 8000