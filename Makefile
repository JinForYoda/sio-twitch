# Makefile for sio-twitch project
BACKEND_DIR := .
FRONTEND_DIR := public
DOCKER_IMAGE := rtmp-rtsp-converter
DOCKER_CONTAINER := rtmp-rtsp-converter

.PHONY: all help install dev dev-frontend dev-backend build build-frontend build-backend start start-frontend start-backend clean docker-build docker-run docker-stop docker-logs docker-shell

all: help

help:
	@echo "Usage: make [target]"
	@echo "Targets: install, dev (installs first), dev-frontend (installs first), dev-backend (installs first),"
	@echo "         build (installs first), start (builds first), clean"
	@echo "Docker targets: docker-build, docker-run, docker-stop, docker-logs, docker-shell"

install:
	cd $(BACKEND_DIR) && npm install
	cd $(FRONTEND_DIR) && npm install

dev-frontend: install
	cd $(FRONTEND_DIR) && npm run dev

dev-backend: install
	cd $(BACKEND_DIR) && npm run dev

dev: install
	(cd $(FRONTEND_DIR) && npm run dev) & (cd $(BACKEND_DIR) && npm run dev) & wait

build-frontend: install
	cd $(FRONTEND_DIR) && npm run build

build-backend: install
	cd $(BACKEND_DIR) && npm run build

build: build-frontend build-backend

start-frontend: build-frontend
	cd $(FRONTEND_DIR) && npm run preview

start-backend: build-backend
	cd $(BACKEND_DIR) && npm start

start: build
	(cd $(FRONTEND_DIR) && npm run preview) & (cd $(BACKEND_DIR) && npm start) & wait

clean:
	rm -rf $(BACKEND_DIR)/dist $(FRONTEND_DIR)/dist

# Docker targets
docker-build:
	docker-compose build

docker-run:
	docker-compose up -d

docker-stop:
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-shell:
	docker exec -it $(DOCKER_CONTAINER) /bin/sh
