# Room Renders

This directory contains room render images organized by room type.

## Folder Structure

Please organize your room render images in the following folders:

- `kitchen/` - Kitchen renders
- `bathroom/` - Bathroom renders
- `living-room/` - Living room renders
- `bedroom/` - Bedroom renders

## Adding Images

1. Create the appropriate folder if it doesn't exist (living-room, bedroom, or bathroom)
2. Add your room render images to the corresponding folder
3. Update the `roomRenders` array in `src/components/VisualizerPreview.tsx` to include your new images

## Example Structure

```
room_renders/
  ├── kitchen/
  │   ├── thumbnail.jpg (for the room type selector)
  │   ├── kitchen-1.jpg
  │   ├── kitchen-2.jpg
  │   └── ...
  ├── bathroom/
  │   ├── thumbnail.jpg (for the room type selector)
  │   ├── bathroom-1.jpg
  │   ├── bathroom-2.jpg
  │   └── ...
  ├── living-room/
  │   ├── thumbnail.jpg (for the room type selector)
  │   ├── living-room-1.jpg
  │   ├── living-room-2.jpg
  │   └── ...
  └── bedroom/
      ├── thumbnail.jpg (for the room type selector)
      ├── bedroom-1.jpg
      ├── bedroom-2.jpg
      └── ...
```

## Image Requirements

- Supported formats: JPG, PNG, WebP
- Recommended size: 1200x800px or similar aspect ratio
- File size: Keep under 5MB for optimal performance
