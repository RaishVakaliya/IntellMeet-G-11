FROM node:20-bookworm-slim

# Install system dependencies: Python 3, pip, ffmpeg
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY python/requirements.txt ./python/
RUN pip3 install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu --break-system-packages \
    && pip3 install --no-cache-dir -r python/requirements.txt --break-system-packages

COPY . .

EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "start"]
