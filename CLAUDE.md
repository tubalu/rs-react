# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React application built with Rsbuild, a modern web bundler. The project uses React 19 with Biome for code formatting and linting.

## Essential Commands

### Development
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build for production 
- `npm run preview` - Preview production build locally

### Code Quality
- `npm run check` - Run Biome linter and apply fixes
- `npm run format` - Format code using Biome

## Architecture

### Build System
- **Rsbuild**: Modern bundler configured in `rsbuild.config.mjs`
- **React Plugin**: Uses `@rsbuild/plugin-react` for React support
- **Module Type**: ESM modules (`"type": "module"` in package.json)

### Code Standards
- **Biome**: Handles both linting and formatting
  - Single quotes for JavaScript
  - Space indentation
  - CSS Modules support enabled
  - Import organization enabled
  - Git integration configured

### Source Structure
- `src/index.jsx` - Application entry point with React.StrictMode
- `src/App.jsx` - Main application component
- `src/App.css` - Application styles with dark gradient theme

## Package Manager

This project uses `npm` for package management and deployment compatibility with Vercel. Always use `npm` commands.