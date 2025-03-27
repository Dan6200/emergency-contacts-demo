# Variables
PKG_MANAGER = pnpm

# Targets
install:
	$(PKG_MANAGER) install

build:
	$(PKG_MANAGER) run build

start:
	$(PKG_MANAGER) start

dev:
	$(PKG_MANAGER) run dev

test:
	$(PKG_MANAGER) test

clean:
	rm -rf dist node_modules

reinstall:
	rm -rf node_modules pnpm-lock.yaml
	$(PKG_MANAGER) install

lint:
	$(PKG_MANAGER) run lint

format:
	$(PKG_MANAGER) run format

