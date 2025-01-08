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

# Define build-time arguments for environment variables
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY
ARG GROQ_API_KEY
ARG DEEPGRAM_API_KEY
ARG IMAGE_GENERATION_API_URL

# Set environment variables from build-time arguments
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
ENV CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
ENV GROQ_API_KEY=${GROQ_API_KEY}
ENV DEEPGRAM_API_KEY=${DEEPGRAM_API_KEY}
ENV IMAGE_GENERATION_API_URL=${IMAGE_GENERATION_API_URL}

# Build the Next.js app

RUN pnpm build

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
# Example build command with build arguments
# This should be executed in your deployment pipeline or scripts, not inside the Dockerfile.
# docker build --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY} \
#              --build-arg CLERK_SECRET_KEY=${CLERK_SECRET_KEY} \
#              --build-arg GROQ_API_KEY=${GROQ_API_KEY} \
#              --build-arg DEEPGRAM_API_KEY=${DEEPGRAM_API_KEY} \
#              --build-arg IMAGE_GENERATION_API_URL=${IMAGE_GENERATION_API_URL} \
#              -t your-image-name .