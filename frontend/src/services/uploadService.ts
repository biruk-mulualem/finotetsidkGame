// src/services/uploadService.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

// ============================================
// TYPES
// ============================================

export interface UploadedFile {
  filename: string;
  url: string;
  path: string;
  size: number;
  mimetype: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: UploadedFile | UploadedFile[];
  error?: string;
}

// ============================================
// API CONFIGURATION
// ============================================

const getApiUrl = (): string => {
  if (typeof window !== 'undefined' && (window as any).__API_URL__) {
    return (window as any).__API_URL__;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  }
  return 'http://localhost:3001/api';
};

const API_URL = getApiUrl();

console.log('🔗 Upload API_URL:', API_URL);

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  timeout: 60000, // 60 seconds for file uploads
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// UPLOAD SERVICE
// ============================================

const uploadService = {
  /**
   * Upload a single image
   * POST /api/upload/image
   */
  uploadImage: async (file: File): Promise<UploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post<UploadResponse>('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  /**
   * Upload multiple images
   * POST /api/upload/images
   */
  uploadImages: async (files: File[]): Promise<UploadResponse> => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await api.post<UploadResponse>('/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  /**
   * Upload a single audio file
   * POST /api/upload/audio
   */
  uploadAudio: async (file: File): Promise<UploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('audio', file);
      
      const response = await api.post<UploadResponse>('/upload/audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  /**
   * Upload multiple audio files
   * POST /api/upload/audios
   */
  uploadAudios: async (files: File[]): Promise<UploadResponse> => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('audios', file);
      });
      
      const response = await api.post<UploadResponse>('/upload/audios', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  /**
   * Delete an uploaded file
   * DELETE /api/upload/:type/:filename
   */
  deleteFile: async (type: 'image' | 'audio', filename: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/upload/${type}/${filename}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },
};

// ============================================
// CUSTOM HOOKS
// ============================================

import { useState, useCallback } from 'react';

/**
 * Hook for uploading images
 */
export const useImageUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const uploadImage = useCallback(async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const response = await uploadService.uploadImage(file);
      if (response.success && response.data) {
        const fileData = Array.isArray(response.data) ? response.data[0] : response.data;
        setUploadedFile(fileData);
        return fileData;
      }
      return null;
    } catch (err: any) {
      setError(err.error || 'Failed to upload image');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setUploadedFile(null);
    setError(null);
  }, []);

  return { uploadImage, loading, error, uploadedFile, reset };
};

/**
 * Hook for uploading audio files
 */
export const useAudioUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const uploadAudio = useCallback(async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const response = await uploadService.uploadAudio(file);
      if (response.success && response.data) {
        const fileData = Array.isArray(response.data) ? response.data[0] : response.data;
        setUploadedFile(fileData);
        return fileData;
      }
      return null;
    } catch (err: any) {
      setError(err.error || 'Failed to upload audio');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setUploadedFile(null);
    setError(null);
  }, []);

  return { uploadAudio, loading, error, uploadedFile, reset };
};

export default uploadService;