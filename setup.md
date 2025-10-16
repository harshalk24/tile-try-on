# Tile Try-On Setup Guide

This guide will help you set up the tile visualization application with both frontend and backend components.

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

## Setup Instructions

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
# Install Node.js backend dependencies
npm install express multer cors nodemon concurrently

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Set up Replicate API Key

Make sure you have your Replicate API token. The current token in the code is:
`r8_GPNcY5WFRUbT0zdZ56AA1A3uGMdZZrM2KFyQS`

**Important**: Replace this with your own API key for security.

### 4. Running the Application

#### Option 1: Run both frontend and backend together
```bash
npm run dev:full
```

#### Option 2: Run them separately

**Terminal 1 - Backend Server:**
```bash
npm run server:dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:8080
- Backend API: http://localhost:3003
- Health Check: http://localhost:3003/health

## How It Works

1. **Frontend**: React app with Vite, allows users to upload room images and select tiles
2. **Backend**: Express.js server that handles file uploads and calls Python scripts
3. **Python Script**: Uses Replicate API with ControlNet Tile model for AI-powered tile visualization
4. **Process Flow**:
   - User uploads room image and selects tile
   - Frontend sends request to backend API
   - Backend downloads tile image and runs Python script
   - Python script uses floor segmentation and ControlNet for visualization
   - Result image URL is returned to frontend
   - Frontend displays the before/after comparison

## API Endpoints

- `GET /health` - Server health check
- `POST /api/visualize` - Main visualization endpoint
  - Body: FormData with `roomImage` (file) and `tileId` (string)
  - Response: JSON with `imageUrl` of the result

## Troubleshooting

### Common Issues

1. **"Visualization server is offline"**
   - Make sure the backend server is running on port 3001
   - Check if Python dependencies are installed

2. **Python script errors**
   - Ensure all Python packages are installed: `pip install -r requirements.txt`
   - Check if Replicate API token is valid

3. **File upload issues**
   - Check file size (max 10MB)
   - Ensure file is a valid image format (JPG, PNG)

### Logs

- Backend logs: Check the terminal running `npm run server:dev`
- Frontend logs: Check browser console
- Python logs: Check backend terminal for Python script output

## Development

### Adding New Tiles

Update the `tileImages` object in `server.js` with new tile IDs and image URLs.

### Modifying the AI Model

The Python script in `server.js` can be modified to use different Replicate models or parameters.

### Frontend Customization

The React components can be customized in the `src/components/` directory.
