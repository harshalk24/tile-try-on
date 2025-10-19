# Room Renders Directory

This directory contains predefined room images that users can select from instead of uploading their own photos.

## How to add room images:

1. Add your room image files (JPG, PNG) to this directory
2. Update the `roomRenders` array in `src/components/UploadArea.tsx` to include your new images
3. Follow the naming convention: `room-[name].jpg` or `room-[name].png`

## Supported formats:
- JPG/JPEG
- PNG
- WebP

## Recommended image specifications:
- Resolution: 1024x1024 or higher
- File size: Under 5MB for optimal performance
- Clear, well-lit room photos work best for visualization
