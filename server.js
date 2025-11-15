import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3003;


// Middleware
app.use(cors());
app.use(express.json());
// Serve built frontend (Vite) if present
app.use(express.static(path.join(__dirname, 'dist')));

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

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve the resized images (dynamic filenames)
app.get('/temp_resized_*', (req, res) => {
  const filename = req.path.substring(1); // Remove leading slash
  const resizedPath = path.join(__dirname, 'public', filename);
  if (fs.existsSync(resizedPath)) {
    res.sendFile(resizedPath);
  } else {
    res.status(404).json({ error: 'Resized image not found' });
  }
});

// Main visualization endpoint
app.post('/api/visualize', upload.fields([
  { name: 'roomImage', maxCount: 1 },
  { name: 'customTileFile', maxCount: 1 },
  { name: 'wallTileFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const roomImage = req.files?.roomImage?.[0];
    const customTileFile = req.files?.customTileFile?.[0];
    const wallTileFile = req.files?.wallTileFile?.[0];
    
    if (!roomImage) {
      return res.status(400).json({ error: 'No room image uploaded' });
    }

    const { tileId, visualizationType } = req.body;

    // Validate wall tile if required
    if ((visualizationType === 'walls' || visualizationType === 'both') && !wallTileFile) {
      return res.status(400).json({ error: 'Wall tile image is required for wall visualization' });
    }

    // For walls-only visualization, we don't need a floor tile
    let tileImageUrl = null;
    if (visualizationType !== 'walls') {
      if (!tileId) {
        return res.status(400).json({ error: 'No tile ID provided' });
      }
      
      // Check if it's a custom tile upload
      if (customTileFile && tileId.startsWith('custom-tile-')) {
        tileImageUrl = customTileFile.path;
        console.log('Processing visualization request with custom tile...');
      } else {
        // Use predefined tile
        tileImageUrl = tileImages[tileId];
        if (!tileImageUrl) {
          return res.status(400).json({ error: 'Invalid tile ID' });
        }
        console.log('Processing visualization request with predefined tile...');
      }
    } else {
      console.log('Processing walls-only visualization (no floor tile needed)...');
    }

    console.log('Room image:', roomImage.path);
    console.log('Tile ID:', tileId);
    console.log('Tile image URL:', tileImageUrl);
    console.log('Visualization type:', visualizationType || 'floor');
    console.log('Wall tile file:', wallTileFile?.path || 'None');

    // Determine wall tile path if provided
    let wallTilePath = null;
    if (wallTileFile) {
      wallTilePath = wallTileFile.path;
    }

    // Call Python script for visualization
    const result = await runVisualization(
      roomImage.path, 
      tileImageUrl, 
      tileId, 
      visualizationType || 'floor',
      wallTilePath
    );
    
    // Clean up uploaded files
    fs.unlinkSync(roomImage.path);
    if (customTileFile) {
      fs.unlinkSync(customTileFile.path);
    }
    if (wallTileFile) {
      fs.unlinkSync(wallTileFile.path);
    }
    
    res.json({
      success: true,
      imageUrl: result.imageUrl,
      message: 'Visualization completed successfully'
    });

  } catch (error) {
    console.error('Visualization error:', error);
    
    // Clean up uploaded files on error
    const roomImage = req.files?.roomImage?.[0];
    const customTileFile = req.files?.customTileFile?.[0];
    const wallTileFile = req.files?.wallTileFile?.[0];
    
    if (roomImage && fs.existsSync(roomImage.path)) {
      fs.unlinkSync(roomImage.path);
    }
    if (customTileFile && fs.existsSync(customTileFile.path)) {
      fs.unlinkSync(customTileFile.path);
    }
    if (wallTileFile && fs.existsSync(wallTileFile.path)) {
      fs.unlinkSync(wallTileFile.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to process visualization',
      details: error.message 
    });
  }
});

// Function to run Python visualization script
async function runVisualization(roomImagePath, tileImageUrl, tileId, visualizationType = 'floor', wallTilePath = null) {
  return new Promise((resolve, reject) => {
    // Create a temporary directory for this request
    const tempDir = `temp_${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tileImagePath = tileImageUrl ? path.join(tempDir, 'tile.jpg') : null;
    const wallTileImagePath = wallTilePath ? path.join(tempDir, 'wall_tile.jpg') : null;
    
    // Copy local tile image to temp directory (only if floor tile is needed)
    if (tileImageUrl) {
      if (!fs.existsSync(tileImageUrl)) {
        reject(new Error(`Tile image not found: ${tileImageUrl}`));
        return;
      }
      fs.copyFileSync(tileImageUrl, tileImagePath);
    }

    // Copy wall tile image if provided
    if (wallTilePath && fs.existsSync(wallTilePath)) {
      fs.copyFileSync(wallTilePath, wallTileImagePath);
    }
    
    // Read Replicate token from environment (do not hardcode)
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      reject(new Error('REPLICATE_API_TOKEN is not set as an environment variable.'));
      return;
    }

    // Run Python script
    const pythonScript = `
import os
import replicate
import tempfile
from PIL import Image
import requests
import io
import sys

# Ensure API token is available in environment
if "REPLICATE_API_TOKEN" not in os.environ or not os.environ.get("REPLICATE_API_TOKEN"):
    sys.exit("Error: REPLICATE_API_TOKEN environment variable is not set.")

# Image paths - use absolute paths
room_path = r"${roomImagePath.replace(/\\/g, '\\\\')}"
${tileImagePath ? `tile_path = r"${tileImagePath.replace(/\\/g, '\\\\')}"` : 'tile_path = None'}
${wallTileImagePath ? `wall_tile_path = r"${wallTileImagePath.replace(/\\/g, '\\\\')}"` : 'wall_tile_path = None'}
visualization_type = "${visualizationType}"

try:
    # No need for floor segmentation with nano-banana model
    print("Using nano-banana model for direct image processing...")
    print(f"Visualization type: {visualization_type}")
    print(f"Wall tile provided: {wall_tile_path is not None}")

    # Function to apply EXIF orientation correction
    def apply_exif_orientation(img):
        """Apply EXIF orientation to image if present"""
        try:
            # Method 1: Try using PIL's ImageOps.exif_transpose (PIL 8.0+)
            try:
                from PIL import ImageOps
                img = ImageOps.exif_transpose(img)
                print("Applied EXIF orientation using ImageOps.exif_transpose")
                return img
            except (ImportError, AttributeError):
                pass
            
            # Method 2: Manual EXIF orientation handling (fallback)
            try:
                exif = img._getexif()
                if exif is not None:
                    # Try different methods to get orientation tag
                    orientation = None
                    # Direct tag number (274 is the orientation tag)
                    if 274 in exif:
                        orientation = exif[274]
                    # Try using ExifTags
                    else:
                        try:
                            from PIL.ExifTags import ORIENTATION
                            orientation = exif.get(ORIENTATION)
                        except (ImportError, AttributeError, KeyError):
                            pass
                    
                    if orientation:
                        print(f"Found EXIF orientation: {orientation}")
                        if orientation == 2:
                            img = img.transpose(Image.FLIP_LEFT_RIGHT)
                        elif orientation == 3:
                            img = img.rotate(180, expand=True)
                        elif orientation == 4:
                            img = img.transpose(Image.FLIP_TOP_BOTTOM)
                        elif orientation == 5:
                            img = img.rotate(-90, expand=True).transpose(Image.FLIP_LEFT_RIGHT)
                        elif orientation == 6:
                            img = img.rotate(-90, expand=True)
                        elif orientation == 7:
                            img = img.rotate(90, expand=True).transpose(Image.FLIP_LEFT_RIGHT)
                        elif orientation == 8:
                            img = img.rotate(90, expand=True)
            except (AttributeError, KeyError, TypeError):
                pass
        except Exception as e:
            print(f"No EXIF orientation data or error reading it: {e}")
        return img

    # Load and correct orientation of room image BEFORE processing
    print("Loading and correcting room image orientation...")
    room_img = Image.open(room_path)
    room_img = apply_exif_orientation(room_img)
    
    # Save the corrected room image to a temporary file
    corrected_room_path = os.path.join(tempfile.gettempdir(), f"corrected_room_{int(time.time() * 1000)}.jpg")
    room_img.save(corrected_room_path, 'JPEG', quality=95)
    room_path = corrected_room_path
    print(f"Corrected room image saved to: {room_path}")

    # Run Google Nano-Banana model
    print("Sending request to Replicate (google/nano-banana)...")

    # Determine prompt and image inputs based on visualization type
    if wall_tile_path and visualization_type in ["walls", "both"]:
        # Use combined prompt for floor + wall visualization
        if visualization_type == "both":
          prompt = (

          "Execute a surgical, high-fidelity material replacement on the provided interior room photograph using: "
          "The second image as the floor material reference, and "
          "The third image as the wall material reference. "
          "Goal: Replace only the visible floor plane and vertical wall surfaces. Preserve all non-masked elements — ceiling, furniture, decor, windows, lights, and reflections — perfectly intact. "
          
          "Step 1 — Floor Replacement (Geometry Critical): "
          "Identify and mask ONLY the floor plane, rigorously excluding walls, furniture bases, and shadows.[1] "
          "Apply the floor material texture (from image 2) enforcing strict **vanishing point alignment and accurate perspective scaling** of the pattern/grout lines. "
          "Use **context-aware recognition** to integrate the new floor texture.[5] Maintain the realistic light direction and generate **accurate contact shadows** under all furniture.[6] "
          "**Crucially, suppress all texture repetition or visible tiling artifacts** across the floor surface. "
          
          "Step 2 — Wall Replacement (Precision Critical): "
          "Identify and mask ONLY the vertical wall surfaces. "
          "Replace these with the wall material texture (from image 3). The new material must maintain the **original light gradients and tone mapping** of the wall planes.[6] "
          "**Preserve all existing geometric boundaries** precisely near windows, door frames, and ceiling/floor junctions, enforced by ControlNet Canny edge guidance. "

          "Step 3 — Integration & Blending: "
          "Ensure a seamless, **multi-level frequency blend** at all mask boundaries (edge-aware transition) to prevent harsh cut lines or bleed. "
          "The final output must be **photorealistic and high-detail**, appearing as if both materials were physically installed with zero AI noise or geometric distortion.[12, 13]"
      )

        else:
            # Walls only - use the high-precision prompt
            prompt = (
            "Execute a surgical, high-precision visual edit on the provided room photo using the second image as the wall material reference."

            "Objective: Replace ONLY the visible vertical wall surfaces in the room with the new material, covering the ENTIRE continuous wall plane with no gaps or partial edits. Keep all other elements—ceiling, floor, furniture, windows, decor, ducting, and lighting—perfectly intact."

            "Instructions: "
            "Identify and mask ONLY the true wall regions (semantic segmentation), including all connected vertical planes even if lighting varies or corners create low-contrast boundaries. Do NOT leave any portion of the wall unedited."
            "Maintain extremely precise wall boundaries, ensuring no spillover onto ceiling, floor, windows, trim, or furniture. Respect the original architectural layout—do NOT invent new walls or expand existing ones."
            "Apply the new wall material with correct perspective alignment, scale, and vanishing point coherence. Preserve the original lighting, shadows, reflections, and depth cues so the material integrates naturally."
            "Use a soft, feathered blending transition along all edges to eliminate haloing, masking noise, or bleed onto nearby objects. Preserve sharp edges where the wall meets windows, pillars, or ceiling lines."
            "Suppress all repetitive texture patterns, tiling artifacts, noise, and overpainting errors. Ensure the applied texture remains clean, realistic, and consistent across the full wall surface."
            "The final result must be photorealistic, high-detail, and perfectly integrated with the original room geometry—appearing as if the new wall material was physically installed."
        )
        
        # Handle "both" visualization with 3 images (room, floor tile, wall tile)
        if visualization_type == "both":
            room_file = open(room_path, "rb")
            tile_file = open(tile_path, "rb")
            wall_file = open(wall_tile_path, "rb")
            try:
                input_data = {
                    "prompt": prompt,
                    "image_input": [room_file, tile_file, wall_file]  # Pass three file objects
                }
                
                # Execute Replicate call with retries
                output = None
                attempts = 0
                last_error = None
                while attempts < 3 and output is None:
                    try:
                        output = replicate.run(
                            "google/nano-banana",
                            input=input_data
                        )
                    except Exception as e:
                        last_error = e
                        print(f"Warning: Replicate call failed (attempt {attempts+1}/3): {e}")
                        import time
                        time.sleep(2)
                    finally:
                        attempts += 1
                if output is None:
                    raise RuntimeError(f"Replicate call failed after retries: {last_error}")
            finally:
                room_file.close()
                tile_file.close()
                wall_file.close()
        else:
            # Walls only - use 2 images (room, wall tile)
            room_file = open(room_path, "rb")
            wall_file = open(wall_tile_path, "rb")
            try:
                input_data = {
                    "prompt": prompt,
                    "image_input": [room_file, wall_file]  # Pass two file objects (room + wall tile)
                }
                
                # Execute Replicate call with retries
                output = None
                attempts = 0
                last_error = None
                while attempts < 3 and output is None:
                    try:
                        output = replicate.run(
                            "google/nano-banana",
                            input=input_data
                        )
                    except Exception as e:
                        last_error = e
                        print(f"Warning: Replicate call failed (attempt {attempts+1}/3): {e}")
                        import time
                        time.sleep(2)
                    finally:
                        attempts += 1
                if output is None:
                    raise RuntimeError(f"Replicate call failed after retries: {last_error}")
            finally:
                room_file.close()
                wall_file.close()
    else:
        # Floor only - original prompt
        prompt = (
        "Perform a surgical, precise visual edit on the provided room photo: "
        "Identify and mask ONLY the floor area (semantic segmentation) [1], ensuring 100% coverage of the visible floor plane. "
        "Replace the flooring material using the second image as the tile reference. "
        "The new material must enforce strict **vanishing point alignment and accurate perspective scaling** for the pattern/grout lines. "
        "Blend the new floor texture naturally, adjusting for scale, angle, and light reflection. Anchor all furniture with **realistic contact shadows**.[6] "
        "**Suppress all repetitive texture patterns or visible tiling artifacts**. "
        "Do not alter walls, furniture, ceiling, or lighting setup. "
        "Keep the result **photorealistic and high-detail**, looking physically installed with seamless, soft edge transitions.[10, 12]"
    )
        
        room_file = open(room_path, "rb")
        tile_file = open(tile_path, "rb")
        try:
            input_data = {
                "prompt": prompt,
                "image_input": [room_file, tile_file]  # Pass file objects here
            }
            
            # Execute Replicate call with retries
            output = None
            attempts = 0
            last_error = None
            while attempts < 3 and output is None:
                try:
                    output = replicate.run(
                        "google/nano-banana",
                        input=input_data
                    )
                except Exception as e:
                    last_error = e
                    print(f"Warning: Replicate call failed (attempt {attempts+1}/3): {e}")
                    import time
                    time.sleep(2)
                finally:
                    attempts += 1
            if output is None:
                raise RuntimeError(f"Replicate call failed after retries: {last_error}")
        finally:
            room_file.close()
            tile_file.close()

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

    # Resize output image to match original room image dimensions EXACTLY
    if output_url:
        try:
            # Download the generated image with simple retries
            import requests
            session = requests.Session()
            response = None
            for i in range(3):
                try:
                    response = session.get(output_url, timeout=30)
                    response.raise_for_status()
                    break
                except Exception as e:
                    if i == 2:
                        raise
                    print(f"Warning: image download failed (attempt {i+1}/3): {e}")
                    import time
                    time.sleep(2)
            generated_img = Image.open(io.BytesIO(response.content))
            
            # Get original room image dimensions (already corrected for orientation)
            # Use the corrected room image that was saved earlier
            original_img = Image.open(room_path)
            original_size = original_img.size
            
            print(f"Original image size (after orientation correction): {original_size}")
            print(f"Generated image size: {generated_img.size}")
            
            # ALWAYS resize to match original dimensions exactly
            print(f"Resizing generated image from {generated_img.size} to {original_size}")
            generated_img = generated_img.resize(original_size, Image.Resampling.LANCZOS)
            
            # Save resized image to a temporary file in the public directory
            # Get the server's public directory path from environment variable
            server_root = os.environ.get('SERVER_ROOT', os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            
            # Generate unique filename to avoid caching issues
            import time
            unique_filename = f"temp_resized_{int(time.time() * 1000)}.jpg"
            public_resized_path = os.path.join(server_root, 'public', unique_filename)
            
            # Ensure the public directory exists
            os.makedirs(os.path.dirname(public_resized_path), exist_ok=True)
            
            # Save with proper orientation (save without EXIF to prevent double rotation)
            # The image is already correctly oriented, so we save it as-is
            generated_img.save(public_resized_path, 'JPEG', quality=95, optimize=True, exif=b'')
            
            # Return the local path that can be served by the web server
            # Use the same origin as the request to avoid hardcoded localhost
            output_url = f"/{unique_filename}"
            print("Image resized to match original dimensions exactly")
            print(f"Resized image available at: {output_url}")
                
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
        // Try python3 first, fallback to python
        const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
        const python = spawn(pythonCommand, [scriptPath], {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { 
            ...process.env, 
            REPLICATE_API_TOKEN: replicateToken,
            SERVER_ROOT: __dirname
          }
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
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Tile visualization server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🎨 Visualization API: http://localhost:${PORT}/api/visualize`);
});

// Fallback to index.html for SPA routes and root
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not Found');
  }
});

export default app;
