FROM python:3.12-slim

# Create non-root user
RUN groupadd -r vulnscan && useradd -r -g vulnscan vulnscan

WORKDIR /app

RUN apt-get update && apt-get install -y \
    git \
    && pip install semgrep \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Switch to non-root user
USER vulnscan

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
