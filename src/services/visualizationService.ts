/**
 * API Base URL Configuration
 * 
 * Development: Uses http://localhost:3003 (backend server port)
 * Production: Uses window.location.origin (same origin as frontend)
 * Override: Set VITE_API_BASE_URL environment variable
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'http://localhost:3003' : window.location.origin);

export interface VisualizationRequest {
  roomImage?: File;
  renderImagePath?: string; // Path to render image in public/room_renders
  tileId: string;
  customTileFile?: File;
  visualizationType?: "floor" | "walls" | "both";
  wallTileFile?: File;
}

export interface VisualizationResponse {
  success: boolean;
  imageUrl: string;
  message: string;
}

export class VisualizationService {
  static async visualizeRoom(request: VisualizationRequest): Promise<VisualizationResponse> {
    const formData = new FormData();
    
    // Add room image file if provided (for custom uploads)
    if (request.roomImage) {
      formData.append('roomImage', request.roomImage);
    }
    
    // Add render image path if provided (for pre-uploaded renders)
    if (request.renderImagePath) {
      formData.append('renderImagePath', request.renderImagePath);
    }
    
    formData.append('tileId', request.tileId);
    formData.append('visualizationType', request.visualizationType || 'floor');
    
    // Add custom tile file if provided
    if (request.customTileFile) {
      formData.append('customTileFile', request.customTileFile);
    }

    // Add wall tile file if provided
    if (request.wallTileFile) {
      formData.append('wallTileFile', request.wallTileFile);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/visualize`, {
        method: 'POST',
        body: formData,
      });

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        let errorMessage = 'Failed to process visualization';
        
        if (isJson) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
            if (errorData.details) {
              errorMessage += `: ${errorData.details}`;
            }
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
          }
        } else {
          // If response is HTML (like a 404 page), get text instead
          const text = await response.text();
          console.error('Server returned non-JSON response:', text.substring(0, 200));
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      if (!isJson) {
        const text = await response.text();
        console.error('Server returned non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned invalid response format');
      }

      const result = await response.json();
      
      // Convert relative URLs to absolute URLs
      if (result.imageUrl && result.imageUrl.startsWith('/')) {
        // Add cache-busting parameter if not already present
        const separator = result.imageUrl.includes('?') ? '&' : '?';
        const cacheBuster = `_t=${Date.now()}`;
        result.imageUrl = API_BASE_URL + result.imageUrl + separator + cacheBuster;
      }
      
      console.log('✓ Received visualization result from API:');
      console.log('  Image URL:', result.imageUrl);
      console.log('  This is the real-time nano-banana generated image');
      
      return result;
    } catch (error) {
      console.error('Visualization API error:', error);
      // Re-throw with more context if it's not already an Error
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Visualization failed: ${String(error)}`);
      }
    }
  }

  static async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Server health check failed:', error);
      return false;
    }
  }
}
