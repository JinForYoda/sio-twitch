PHONY: help
.DEFAULT_GOAL := help

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

init: down build up

build: ## Build services.
	docker compose build $(c)

up: ## Create and start services.
	docker compose up -d $(c)

restart: ## Restart services.
	docker compose restart $(c)

down: ## Stop and remove containers and volumes.
	docker compose down -v $(c)

down-force:
	docker compose down -v --rmi=all --remove-orphans
