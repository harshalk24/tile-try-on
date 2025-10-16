const API_BASE_URL = 'http://localhost:3003';

export interface VisualizationRequest {
  roomImage: File;
  tileId: string;
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
