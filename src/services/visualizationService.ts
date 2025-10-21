// Use environment variable for API base URL, fallback to current origin
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;

export interface VisualizationRequest {
  roomImage: File;
  tileId: string;
  customTileFile?: File;
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
    
    // Add custom tile file if provided
    if (request.customTileFile) {
      formData.append('customTileFile', request.customTileFile);
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
