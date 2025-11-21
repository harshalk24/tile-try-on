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
    // Check if it's an image by mimetype or extension
    const isImage = file.mimetype.startsWith('image/') || 
                    /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.originalname);
    
    if (isImage) {
      cb(null, true);
    } else {
      console.error('File rejected:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype
      });
      cb(new Error(`Only image files are allowed! Received: ${file.mimetype || 'unknown type'}`), false);
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

// Serve the resized images (dynamic filenames) - these are nano-banana generated images
// Serve the resized images (dynamic filenames) - these are nano-banana generated images
app.get('/temp_resized_*', (req, res) => {
  // Extract filename from path (remove query parameters)
  const pathWithoutQuery = req.path.split('?')[0];
  const filename = pathWithoutQuery.substring(1); // Remove leading slash
  const resizedPath = path.join(__dirname, 'public', filename);
  
  console.log('='.repeat(60));
  console.log('Serving resized image (nano-banana output):');
  console.log('  Requested filename:', filename);
  console.log('  Full path:', resizedPath);
  console.log('  File exists:', fs.existsSync(resizedPath));
  if (fs.existsSync(resizedPath)) {
    const stats = fs.statSync(resizedPath);
    console.log('  File size:', stats.size, 'bytes');
    console.log('  File created:', stats.birthtime);
    console.log('  File modified:', stats.mtime);
  }
  console.log('='.repeat(60));
  
  if (fs.existsSync(resizedPath)) {
    // Set aggressive cache headers to prevent caching of generated images
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Last-Modified', new Date().toUTCString());
    res.setHeader('ETag', `"${Date.now()}"`);
    res.sendFile(resizedPath);
  } else {
    console.error('ERROR: Resized image not found:', resizedPath);
    res.status(404).json({ error: 'Resized image not found', filename: filename });
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
    const { tileId, visualizationType, renderImagePath: rawRenderImagePath } = req.body;
    
    // Decode renderImagePath if it's URL encoded
    const renderImagePath = rawRenderImagePath ? decodeURIComponent(rawRenderImagePath) : null;
    
    // Either roomImage (custom upload) or renderImagePath (pre-uploaded render) must be provided
    if (!roomImage && !renderImagePath) {
      return res.status(400).json({ error: 'No room image uploaded or render path provided' });
    }

    // Determine room image path
    let roomImagePath;
    if (roomImage) {
      // Custom uploaded image - use multer path
      roomImagePath = path.isAbsolute(roomImage.path) 
        ? roomImage.path 
        : path.resolve(process.cwd(), roomImage.path);
    } else if (renderImagePath) {
      // Render image from public/room_renders - resolve relative to public directory
      // renderImagePath is like "/room_renders/kitchen/kitchen 1.jpg" (starts with /)
      // Remove leading slash and join with public directory
      const renderPath = renderImagePath.startsWith('/') 
        ? renderImagePath.substring(1) 
        : renderImagePath;
      
      // Join with public directory - handle both __dirname and process.cwd() cases
      const publicDir = path.join(__dirname, 'public');
      roomImagePath = path.join(publicDir, renderPath);
      roomImagePath = path.normalize(roomImagePath);
      
      console.log('Render image lookup:');
      console.log('  Original path:', renderImagePath);
      console.log('  Render path (no leading slash):', renderPath);
      console.log('  Public directory:', publicDir);
      console.log('  Resolved path:', roomImagePath);
      console.log('  Public dir exists:', fs.existsSync(publicDir));
      console.log('  Resolved path exists:', fs.existsSync(roomImagePath));
      
      // Try alternative path if first doesn't work (relative to process.cwd())
      if (!fs.existsSync(roomImagePath)) {
        const altPath = path.join(process.cwd(), 'public', renderPath);
        console.log('  Trying alternative path:', altPath);
        console.log('  Alternative path exists:', fs.existsSync(altPath));
        if (fs.existsSync(altPath)) {
          roomImagePath = path.normalize(altPath);
        }
      }
      
      // Validate render image exists
      if (!fs.existsSync(roomImagePath)) {
        // List files in the directory to help debug
        const dirPath = path.dirname(roomImagePath);
        let dirContents = [];
        if (fs.existsSync(dirPath)) {
          try {
            dirContents = fs.readdirSync(dirPath);
          } catch (e) {
            dirContents = ['(cannot read directory)'];
          }
        }
        
        return res.status(400).json({ 
          error: 'Render image not found',
          renderPath: renderImagePath,
          resolvedPath: roomImagePath,
          publicDir: publicDir,
          altPublicDir: path.join(process.cwd(), 'public'),
          directoryContents: dirContents,
          __dirname: __dirname,
          processCwd: process.cwd()
        });
      }
    }

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

    console.log('Room image path:', roomImagePath);
    console.log('Room image source:', roomImage ? 'custom upload' : 'render');
    if (roomImage) {
      console.log('Room image originalname:', roomImage.originalname);
      console.log('Room image mimetype:', roomImage.mimetype);
      console.log('Room image size:', roomImage.size, 'bytes');
    }
    console.log('Tile ID:', tileId);
    console.log('Tile image URL:', tileImageUrl);
    console.log('Visualization type:', visualizationType || 'floor');
    console.log('Wall tile file:', wallTileFile?.path || 'None');

    // Determine wall tile path if provided
    let wallTilePath = null;
    if (wallTileFile) {
      // Multer saves files relative to process.cwd()
      wallTilePath = path.isAbsolute(wallTileFile.path) 
        ? wallTileFile.path 
        : path.resolve(process.cwd(), wallTileFile.path);
      // Validate that the file exists
      if (!fs.existsSync(wallTilePath)) {
        return res.status(400).json({ 
          error: 'Wall tile file not found',
          path: wallTilePath 
        });
      }
    }

    // Validate that the file exists
    console.log('Room image absolute path:', roomImagePath);
    console.log('File exists:', fs.existsSync(roomImagePath));
    
    if (!fs.existsSync(roomImagePath)) {
      return res.status(400).json({ 
        error: 'Room image file not found',
        path: roomImagePath,
        currentWorkingDir: process.cwd()
      });
    }

    // Validate file is readable and has content
    try {
      const stats = fs.statSync(roomImagePath);
      console.log('File size:', stats.size, 'bytes');
      if (stats.size === 0) {
        return res.status(400).json({ 
          error: 'Room image file is empty',
          path: roomImagePath
        });
      }
    } catch (statError) {
      return res.status(400).json({ 
        error: 'Cannot read room image file',
        path: roomImagePath,
        details: statError.message
      });
    }

    // Call Python script for visualization
    const result = await runVisualization(
      roomImagePath, 
      tileImageUrl, 
      tileId, 
      visualizationType || 'floor',
      wallTilePath
    );
    
    // Clean up uploaded files (only custom uploads, not renders)
    if (roomImage) {
      fs.unlinkSync(roomImage.path);
    }
    if (customTileFile) {
      fs.unlinkSync(customTileFile.path);
    }
    if (wallTileFile) {
      fs.unlinkSync(wallTileFile.path);
    }
    
    console.log('✓ Returning visualization result to frontend:');
    console.log('  Image URL:', result.imageUrl);
    console.log('  This is the nano-banana generated image');
    
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
      try {
        fs.unlinkSync(roomImage.path);
      } catch (unlinkError) {
        console.error('Error cleaning up room image:', unlinkError);
      }
    }
    if (customTileFile && fs.existsSync(customTileFile.path)) {
      try {
        fs.unlinkSync(customTileFile.path);
      } catch (unlinkError) {
        console.error('Error cleaning up custom tile:', unlinkError);
      }
    }
    if (wallTileFile && fs.existsSync(wallTileFile.path)) {
      try {
        fs.unlinkSync(wallTileFile.path);
      } catch (unlinkError) {
        console.error('Error cleaning up wall tile:', unlinkError);
      }
    }
    
    // Ensure we always return JSON, not HTML
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false,
        error: 'Failed to process visualization',
        message: error.message || 'An unknown error occurred',
        details: error.stack || String(error)
      });
    }
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
      // Tile images are in public/tiles, resolve relative to __dirname
      const absoluteTilePath = path.isAbsolute(tileImageUrl) 
        ? tileImageUrl 
        : path.resolve(__dirname, tileImageUrl);
      if (!fs.existsSync(absoluteTilePath)) {
        reject(new Error(`Tile image not found: ${absoluteTilePath}`));
        return;
      }
      fs.copyFileSync(absoluteTilePath, tileImagePath);
    }

    // Copy wall tile image if provided
    if (wallTilePath) {
      // wallTilePath is already absolute from above
      if (!fs.existsSync(wallTilePath)) {
        reject(new Error(`Wall tile image not found: ${wallTilePath}`));
        return;
      }
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
import time

# Ensure API token is available in environment
if "REPLICATE_API_TOKEN" not in os.environ or not os.environ.get("REPLICATE_API_TOKEN"):
    sys.exit("Error: REPLICATE_API_TOKEN environment variable is not set.")

# Image paths - use absolute paths
# Normalize paths using os.path.normpath (handles both forward and backslashes)
import os
room_path = os.path.normpath(r"${roomImagePath.replace(/\\/g, '/')}")
${tileImagePath ? `tile_path = os.path.normpath(r"${tileImagePath.replace(/\\/g, '/')}")` : 'tile_path = None'}
${wallTileImagePath ? `wall_tile_path = os.path.normpath(r"${wallTileImagePath.replace(/\\/g, '/')}")` : 'wall_tile_path = None'}
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
    print(f"Attempting to open room image at: {room_path}")
    print(f"File exists: {os.path.exists(room_path)}")
    
    if not os.path.exists(room_path):
        raise FileNotFoundError(f"Room image file not found: {room_path}")
    
    # Check file size
    file_size = os.path.getsize(room_path)
    print(f"File size: {file_size} bytes")
    if file_size == 0:
        raise ValueError(f"Room image file is empty: {room_path}")
    
    # Try to open and verify it's a valid image
    try:
        room_img = Image.open(room_path)
        # Verify the image by loading it (this checks if it's a valid image file)
        room_img.verify()
        # Reopen after verify (verify closes the file)
        room_img = Image.open(room_path)
        print(f"Successfully opened image. Format: {room_img.format}, Size: {room_img.size}, Mode: {room_img.mode}")
    except Exception as img_error:
        raise ValueError(f"Cannot identify image file '{room_path}': {str(img_error)}. File size: {file_size} bytes")
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

    print("=" * 60)
    print("RAW REPLICATE (NANO-BANANA) OUTPUT:")
    print(f"  Output type: {type(output)}")
    print(f"  Output value: {output}")
    print("=" * 60)

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
            print(f"Downloaded image from Replicate (nano-banana output): {output_url}")
            print(f"Downloaded image size: {generated_img.size}, format: {generated_img.format}")
            
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
            # SERVER_ROOT should be the project root (where server.js is located)
            server_root = os.environ.get('SERVER_ROOT')
            if not server_root:
                # Fallback: use current working directory (should be project root when server.js runs)
                server_root = os.getcwd()
            
            # Verify public directory exists
            public_dir = os.path.join(server_root, 'public')
            if not os.path.exists(public_dir):
                print(f"WARNING: public directory not found at {public_dir}")
                print(f"  SERVER_ROOT: {server_root}")
                print(f"  Current working directory: {os.getcwd()}")
                # Try to create it
                try:
                    os.makedirs(public_dir, exist_ok=True)
                    print(f"  Created public directory: {public_dir}")
                except Exception as e:
                    print(f"  ERROR: Could not create public directory: {e}")
                    raise
            
            # Generate unique filename with timestamp and random component to avoid caching issues
            import time
            import random
            timestamp = int(time.time() * 1000)
            random_suffix = random.randint(1000, 9999)
            unique_filename = f"temp_resized_{timestamp}_{random_suffix}.jpg"
            public_resized_path = os.path.join(server_root, 'public', unique_filename)
            
            # Clean up old temp_resized files (older than 1 hour) to prevent accumulation
            try:
                import glob
                temp_files = glob.glob(os.path.join(server_root, 'public', 'temp_resized_*.jpg'))
                current_time = time.time()
                for temp_file in temp_files:
                    try:
                        file_age = current_time - os.path.getmtime(temp_file)
                        if file_age > 3600:  # 1 hour
                            os.remove(temp_file)
                            print(f"Cleaned up old temp file: {os.path.basename(temp_file)}")
                    except Exception as e:
                        print(f"Warning: Could not clean up {temp_file}: {e}")
            except Exception as cleanup_error:
                print(f"Warning: Cleanup failed: {cleanup_error}")
            
            # Ensure the public directory exists
            os.makedirs(os.path.dirname(public_resized_path), exist_ok=True)
            
            # Save with proper orientation (save without EXIF to prevent double rotation)
            # The image is already correctly oriented, so we save it as-is
            generated_img.save(public_resized_path, 'JPEG', quality=95, optimize=True, exif=b'')
            
            # Verify the saved file exists and has content
            saved_size = os.path.getsize(public_resized_path)
            print(f"Saved resized image to: {public_resized_path}")
            print(f"Saved file size: {saved_size} bytes")
            
            # Return the local path (cache-busting handled by unique filename)
            # The unique filename with timestamp already prevents caching
            output_url = f"/{unique_filename}"
            print("=" * 60)
            print("FINAL OUTPUT - NANO-BANANA GENERATED IMAGE:")
            print(f"  Source: Replicate nano-banana model")
            print(f"  Original Replicate URL: {output_url} (before download)")
            print(f"  Resized to match original: {original_size}")
            print(f"  Saved to: {public_resized_path}")
            print(f"  File size: {saved_size} bytes")
            print(f"  RESULT_URL: {output_url}")
            print("=" * 60)
                
        except Exception as resize_error:
            print(f"Warning: Could not resize image: {resize_error}")
            print("Using original generated image")

    if output_url:
        print(f"RESULT_URL:{output_url}")
    else:
        print("ERROR: No output generated")
        sys.exit(1)

except Exception as e:
    import traceback
    print(f"ERROR: {str(e)}")
    print(f"ERROR_TRACEBACK: {traceback.format_exc()}")
    sys.exit(1)

# Cleanup completed
`;

        // Write Python script to file
        const scriptPath = path.join(tempDir, 'visualize.py');
        fs.writeFileSync(scriptPath, pythonScript);

        // Run Python script with timeout
        // Try python3 first, fallback to python
        const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
        
        // Enhanced logging for EC2 debugging
        console.log('='.repeat(60));
        console.log('Executing Python visualization script:');
        console.log('  Python command:', pythonCommand);
        console.log('  Script path:', scriptPath);
        console.log('  REPLICATE_API_TOKEN set:', !!replicateToken);
        console.log('  SERVER_ROOT:', __dirname);
        console.log('  Platform:', process.platform);
        console.log('  Node version:', process.version);
        console.log('='.repeat(60));
        
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
        
        // Log Python command for debugging
        console.log('Running Python script:');
        console.log('  Command:', pythonCommand, scriptPath);
        console.log('  REPLICATE_API_TOKEN set:', !!replicateToken);
        console.log('  SERVER_ROOT:', __dirname);

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

          // Check for ERROR: in output first (even if code is 0)
          const errorMatch = output.match(/ERROR:(.+)/);
          if (errorMatch) {
            console.error('Python script reported error. Full output:', output);
            console.error('Python script error output:', errorOutput);
            reject(new Error(`Python script error: ${errorMatch[1].trim()}`));
            return;
          }

          if (code !== 0) {
            // Log full output for debugging
            console.error('Python script failed. Full output:', output);
            console.error('Python script error output:', errorOutput);
            reject(new Error(`Python script failed with code ${code}: ${errorOutput || output || 'Unknown error'}`));
            return;
          }

          // Extract result URL from output - this is the nano-banana generated image
          const resultMatch = output.match(/RESULT_URL:(.+)/);
          if (resultMatch) {
            const imageUrl = resultMatch[1].trim();
            console.log('✓ Extracted RESULT_URL from Python output:', imageUrl);
            console.log('✓ This is the nano-banana generated image from server.js');
            resolve({ imageUrl: imageUrl });
          } else {
            // Enhanced error logging for EC2 debugging
            console.error('='.repeat(60));
            console.error('ERROR: No RESULT_URL found in Python output');
            console.error('Python exit code:', code);
            console.error('Python stdout length:', output.length);
            console.error('Python stderr length:', errorOutput.length);
            console.error('Last 500 chars of stdout:', output.substring(Math.max(0, output.length - 500)));
            console.error('Last 500 chars of stderr:', errorOutput.substring(Math.max(0, errorOutput.length - 500)));
            console.error('Full stdout:', output);
            console.error('Full stderr:', errorOutput);
            console.error('='.repeat(60));
            
            // Try to extract error message from output
            const errorTraceMatch = output.match(/ERROR_TRACEBACK:([\s\S]+?)(?=\n\n|$)/);
            const errorMsg = errorTraceMatch 
              ? `Python error traceback: ${errorTraceMatch[1].trim()}`
              : `No result URL found. Last 1000 chars of output: ${output.substring(Math.max(0, output.length - 1000))}`;
            
            reject(new Error(errorMsg));
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

// Global error handler middleware (must be before catch-all route)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: err.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Fallback to index.html for SPA routes and root (GET requests only)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Not Found' });
  }
});

export default app;
