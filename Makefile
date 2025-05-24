# Makefile for sio-twitch project
BACKEND_DIR := .
FRONTEND_DIR := public

.PHONY: all help install dev dev-frontend dev-backend build build-frontend build-backend start start-frontend start-backend clean

all: help

help:
	@echo "Usage: make [target]"
	@echo "Targets: install, dev (installs first), dev-frontend (installs first), dev-backend (installs first),"
	@echo "         build (installs first), start (builds first), clean"

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
