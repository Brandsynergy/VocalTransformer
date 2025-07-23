# MEDIAD AUDIOVERTER

## Overview

This is a full-stack web application for voice gender conversion in audio files. The app allows users to upload MP3 files and convert them from male to female voice or vice versa using FFmpeg-based audio processing. It features a modern React frontend with Tailwind CSS and shadcn/ui components, an Express.js backend with PostgreSQL database, and includes licensing verification and subscription management capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom theme configuration
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for smooth UI transitions

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **File Upload**: Multer for handling multipart/form-data
- **Audio Processing**: FFmpeg for voice pitch conversion
- **Payment Processing**: Stripe integration for subscriptions

### Data Storage
- **Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **File Storage**: Local filesystem for uploaded and converted audio files
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Database Schema
- **Users**: Email, password, Stripe customer ID, subscription status
- **Converted Songs**: Original filename, file paths, conversion status, user association
- **Subscriptions**: Stripe plan management, billing periods, cancellation status
- **Usage Limits**: Monthly conversion quotas and tracking
- **Payment History**: Transaction records and payment statuses

### Audio Processing
- **AudioProcessor Class**: Handles voice conversion using FFmpeg
- **Pitch Shifting**: Uses asetrate filter to modify voice pitch (1.3x for female, 0.7x for male)
- **File Management**: Automatic directory creation for uploads and converted files
- **Status Tracking**: Real-time processing status updates

### Authentication & Authorization
- **License Verification**: Custom license key validation system
- **Local Storage**: Persists license verification status
- **Subscription Management**: Stripe-based subscription tiers (Free, Pro, Business)

### File Upload System
- **Drag & Drop**: React Dropzone for intuitive file uploads
- **File Validation**: MP3 format validation and size limits
- **Progress Tracking**: Real-time upload and conversion progress
- **Storage Management**: Organized file structure with proper permissions

## Data Flow

1. **User Authentication**: License verification → Local storage persistence
2. **Audio Upload**: File validation → Multer storage → Database record creation
3. **Voice Conversion**: FFmpeg processing → Pitch modification → Output file generation
4. **Status Updates**: Real-time polling → UI updates → Download availability
5. **Subscription Management**: Stripe checkout → Webhook handling → Database updates

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React, React DOM, React Hook Form
- **UI Framework**: Radix UI primitives, Tailwind CSS, shadcn/ui
- **State Management**: TanStack Query for server state
- **Audio Processing**: FFmpeg (system dependency)
- **Database**: PostgreSQL via Neon, Drizzle ORM
- **Payment Processing**: Stripe API and Stripe.js

### Development Tools
- **Build Tools**: Vite, TypeScript, ESBuild
- **Code Quality**: TypeScript strict mode, ESLint configuration
- **Styling**: PostCSS, Autoprefixer, Tailwind CSS
- **Development**: TSX for TypeScript execution, Replit-specific plugins

## Deployment Strategy

### Production Build
- **Frontend**: Vite build with optimized bundling
- **Backend**: ESBuild compilation to single file
- **Static Assets**: Served from dist/public directory
- **Environment**: NODE_ENV=production with proper error handling

### Development Environment
- **Hot Reload**: Vite HMR for frontend development
- **Database**: Environment-based DATABASE_URL configuration
- **File Permissions**: Automatic directory creation with proper access rights
- **Error Handling**: Development-specific error overlays and logging

### Environment Requirements
- **Node.js**: ES modules support with TypeScript
- **FFmpeg**: System-level installation for audio processing
- **PostgreSQL**: Database server or serverless connection
- **Stripe**: API keys for payment processing
- **File System**: Write permissions for upload directories

The application follows a modern full-stack architecture with clear separation of concerns, real-time updates, and scalable subscription management. The audio processing pipeline is designed for reliability with proper error handling and status tracking throughout the conversion process.