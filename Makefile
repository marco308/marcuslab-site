# marcuslab-site — static single-page site (no build step).
# Served as plain HTML on GitHub Pages under marcuslab.uk.

PORT ?= 8000
HOST ?= localhost
URL  := http://$(HOST):$(PORT)

.DEFAULT_GOAL := help

.PHONY: help serve open deploy status clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

serve: ## Serve with live-reload on file changes (PORT=8000)
	@echo "Serving $(CURDIR) at $(URL) with live-reload — Ctrl-C to stop"
	@npx browser-sync start --server --host $(HOST) --port $(PORT) \
		--no-notify --files "*.html, vendor/**/*.js"

open: ## Open the local site in the default browser
	@open $(URL)

deploy: ## Commit & push to origin (triggers GitHub Pages build)
	@git add -A
	@git commit -m "Update site" || echo "Nothing to commit"
	@git push

status: ## Show git status
	@git status -s

clean: ## Remove macOS/editor cruft
	@find . -name '.DS_Store' -delete
	@echo "Cleaned."
