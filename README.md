# RTMP to RTSP Converter

## Overview

This project converts video streams from RTMP to RTSP and provides a web interface for stream management and monitoring. It includes a backend API, a frontend dashboard, and a MediaMTX instance for ingesting and serving media streams.

## Tech Stack

### Backend

- **Node.js** with **TypeScript**
- **Express** for the REST API
- **MediaMTX** for media ingest and stream processing
- **Winston** for logging

### Frontend

- **React** with **TypeScript**
- **Vite** for bundling
- **Tailwind CSS** for styling
- **Radix UI** components
- **React Player** for stream playback

### Infrastructure

- **Docker** and **Docker Compose**
- **MediaMTX** as the RTMP/RTSP server
- **Supervisor** for process management inside the container

## Project Structure

```text
./
├── backend/            # Backend application (Node.js + Express)
├── frontend/           # Frontend application (React + Vite)
├── shared/             # Shared types and utilities
├── .env                # Environment configuration
├── Dockerfile          # Container build configuration
├── Makefile            # Common project commands
└── docker-compose.yml  # Service orchestration
```

## Getting Started

### Run with Docker

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd sio-twitch
   ```

2. Start the project:

   ```bash
   make init
   ```

   Or run Docker Compose manually:

   ```bash
   docker compose build
   docker compose up -d
   ```

3. Open the web UI:

   ```text
   http://localhost:4173
   ```

## Makefile Commands

- `make build` - build the services
- `make up` - start the services
- `make down` - stop the services and remove containers and volumes
- `make restart` - restart the services
- `make init` - run `down`, `build`, and `up`

## Ports and Services

- **3000**: backend REST API
- **4173**: frontend web UI
- **1935**: RTMP server
- **8554**: RTSP server
- **8888**: HLS
- **8889**: WebRTC
- **9997**: MediaMTX API

Ports are configurable through the `.env` file.

## Recommended OBS Studio Settings

To keep the stream compatible with MediaMTX and ensure stable playback in the web interface, use the following OBS Studio settings.

1. In **Settings -> Output**:
   - Set **Output Mode** to **Advanced**
   - Use **Software (x264)** as the stream encoder
   - Recommended bitrate: **2500-3500 Kbps**
   - Set **Keyframe Interval** to **2 seconds**
   - Use the **Main** profile
   - Use the **veryfast** or **faster** preset

2. In **Settings -> Video**:
   - Recommended output resolution: **1280x720** or **1920x1080**
   - FPS: **30** or **60**

These settings help avoid playback issues, especially for HLS output in the application.

## License

ISC
