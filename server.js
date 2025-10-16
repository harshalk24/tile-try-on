import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Tile images mapping - update with your local image paths
const tileImages = {
  'marble-white-001': path.join(__dirname, 'public', 'tiles', 'marble-tile.jpg'),
  'oak-wood-002': path.join(__dirname, 'public', 'tiles', 'oak-wood.webp'),
  'oak-wood-001': path.join(__dirname, 'public', 'tiles', 'wooden-tile.jpg'),
  'slate-grey-003': path.join(__dirname, 'public', 'tiles', 'design-tile.jpg'),
  'terracotta-004': path.join(__dirname, 'public', 'tiles', 'terracotta-004.jpg'),
  'black-granite-005': path.join(__dirname, 'public', 'tiles', 'black-granite-005.jpg'),
  'hexagon-white-006': path.join(__dirname, 'public', 'tiles', 'hexagon-white-006.jpg')
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Tile visualization server is running' });
});

// Main visualization endpoint
app.post('/api/visualize', upload.single('roomImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No room image uploaded' });
    }

    const { tileId } = req.body;
    if (!tileId) {
      return res.status(400).json({ error: 'No tile ID provided' });
    }

    // Get tile image URL
    const tileImageUrl = tileImages[tileId];
    if (!tileImageUrl) {
      return res.status(400).json({ error: 'Invalid tile ID' });
    }

    console.log('Processing visualization request...');
    console.log('Room image:', req.file.path);
    console.log('Tile ID:', tileId);
    console.log('Tile image URL:', tileImageUrl);

    // Call Python script for visualization
    const result = await runVisualization(req.file.path, tileImageUrl, tileId);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json({
      success: true,
      imageUrl: result.imageUrl,
      message: 'Visualization completed successfully'
    });

  } catch (error) {
    console.error('Visualization error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to process visualization',
      details: error.message 
    });
  }
});

// Function to run Python visualization script
async function runVisualization(roomImagePath, tileImageUrl, tileId) {
  return new Promise((resolve, reject) => {
    // Create a temporary directory for this request
    const tempDir = `temp_${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tileImagePath = path.join(tempDir, 'tile.jpg');
    
    // Copy local tile image to temp directory
    if (!fs.existsSync(tileImageUrl)) {
      reject(new Error(`Tile image not found: ${tileImageUrl}`));
      return;
    }
    
    fs.copyFileSync(tileImageUrl, tileImagePath);
    
    // Run Python script
    const pythonScript = `
import os
import replicate
import tempfile
from PIL import Image
import numpy as np
import shutil
import requests
import io

# Set your API token
os.environ["REPLICATE_API_TOKEN"] = "r8_GPNcY5WFRUbT0zdZ56AA1A3uGMdZZrM2KFyQS"

# Image paths - use absolute paths
room_path = r"${roomImagePath.replace(/\\/g, '\\\\')}"
tile_path = r"${tileImagePath.replace(/\\/g, '\\\\')}"

try:
    # No need for floor segmentation with nano-banana model
    print("Using nano-banana model for direct image processing...")

    # Run Google Nano-Banana model
    print("Sending request to Replicate (google/nano-banana)...")

    # Prompt for flooring replacement
    prompt = (
    "Perform a precise visual edit on the provided room photo: "
    "identify only the floor area and replace its material using the second image as the tile reference. "
    "Preserve the exact same design of the tile. "
    "Preserve the exact camera perspective, room geometry, and proportions. "
    "Do not alter walls, furniture, or lighting setup. "
    "Blend the new floor texture naturally, adjusting for scale, angle, and light reflection so it matches the rest of the room seamlessly. "
    "Use realistic material mapping and soft edge transitions to avoid visible cutouts or overpainting. "
    "Keep it photorealistic, as if the tiles were actually installed."
    )

    # Prepare input data using local image files
    with open(room_path, "rb") as room_file, open(tile_path, "rb") as tile_file:
        input_data = {
            "prompt": prompt,
            "image_input": [room_file, tile_file] # Pass file objects here
        }
        
        output = replicate.run(
            "google/nano-banana",
            input=input_data
        )

    print("Raw Replicate Output:", output)

    # Handle output - Google Nano-Banana returns different output types
    output_url = None
    
    # Check if output is a string URL
    if isinstance(output, str) and output.startswith('http'):
        output_url = output
        print("Image generated successfully!")
        print("Output URL:", output_url)
    elif isinstance(output, list) and len(output) > 0:
        # This part handles cases where the output might be a list of URLs
        output_url = output[0]
        print("Image generated successfully!")
        print("Output URL:", output_url)
    elif hasattr(output, '__str__') and str(output).startswith('http'):
        # Handle FileOutput objects and other types that can be converted to string
        output_url = str(output)
        print("Image generated successfully!")
        print("Output URL:", output_url)
    else:
        print("No usable output returned. Please check Replicate dashboard logs.")
        print("Output type:", type(output))
        print("Output content:", output)

    # Resize output image to match original room image dimensions
    if output_url:
        try:
            # Download the generated image
            import requests
            response = requests.get(output_url)
            generated_img = Image.open(io.BytesIO(response.content))
            
            # Get original room image dimensions
            original_img = Image.open(room_path)
            original_size = original_img.size
            
            # Resize generated image to match original dimensions
            if generated_img.size != original_size:
                print(f"Resizing generated image from {generated_img.size} to {original_size}")
                generated_img = generated_img.resize(original_size, Image.Resampling.LANCZOS)
                
                # Save resized image to a temporary file
                resized_path = os.path.join(os.path.dirname(room_path), 'resized_output.jpg')
                generated_img.save(resized_path, 'JPEG', quality=95)
                
                # Upload resized image to a temporary hosting service or use local path
                # For now, we'll use the original URL but note that resizing was done
                print("Image resized to match original dimensions")
            else:
                print("Generated image already matches original dimensions")
                
        except Exception as resize_error:
            print(f"Warning: Could not resize image: {resize_error}")
            print("Using original generated image")

    if output_url:
        print(f"RESULT_URL:{output_url}")
    else:
        print("ERROR: No output generated")

except Exception as e:
    print(f"Error: {e}")
    print(f"ERROR: {str(e)}")

# Cleanup completed
`;

        // Write Python script to file
        const scriptPath = path.join(tempDir, 'visualize.py');
        fs.writeFileSync(scriptPath, pythonScript);

        // Run Python script with timeout
        const python = spawn('python', [scriptPath], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        // Set a timeout for the Python script (5 minutes)
        const timeout = setTimeout(() => {
          python.kill('SIGTERM');
          reject(new Error('Python script timed out after 5 minutes'));
        }, 5 * 60 * 1000);

        let output = '';
        let errorOutput = '';

        python.stdout.on('data', (data) => {
          output += data.toString();
          console.log('Python output:', data.toString());
        });

        python.stderr.on('data', (data) => {
          errorOutput += data.toString();
          console.error('Python error:', data.toString());
        });

        python.on('close', (code) => {
          // Clear the timeout
          clearTimeout(timeout);
          
          // Clean up temp directory
          if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
          }

          if (code !== 0) {
            reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
            return;
          }

          // Extract result URL from output
          const resultMatch = output.match(/RESULT_URL:(.+)/);
          if (resultMatch) {
            resolve({ imageUrl: resultMatch[1].trim() });
          } else {
            reject(new Error('No result URL found in Python output'));
          }
        });

        python.on('error', (error) => {
          // Clear the timeout
          clearTimeout(timeout);
          
          // Clean up temp directory
          if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
          reject(error);
        });
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Tile visualization server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🎨 Visualization API: http://localhost:${PORT}/api/visualize`);
});

export default app;
