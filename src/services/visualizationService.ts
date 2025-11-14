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
  roomImage: File;
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
    formData.append('roomImage', request.roomImage);
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process visualization');
      }

      const result = await response.json();
      
      // Convert relative URLs to absolute URLs
      if (result.imageUrl && result.imageUrl.startsWith('/')) {
        result.imageUrl = API_BASE_URL + result.imageUrl;
      }
      
      return result;
    } catch (error) {
      console.error('Visualization API error:', error);
      throw error;
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
