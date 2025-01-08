# Use Node.js LTS image
FROM node:20-slim

# Install system dependencies including FFmpeg
RUN apt-get update && apt-get install -y \
  ffmpeg \
  && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies with limited network concurrency to avoid 429 errors
RUN pnpm install --network-concurrency 1

# Copy the rest of the app
COPY . .

# Create directories for generated content
RUN mkdir -p public/generated

# Set permissions
RUN chmod -R 755 public/generated

# Build the Next.js app
RUN pnpm build

# Environment variables will be populated from .env.docker file
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
ENV CLERK_SECRET_KEY=""
ENV GROQ_API_KEY=""
ENV DEEPGRAM_API_KEY=""
ENV IMAGE_GENERATION_API_URL=""

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]