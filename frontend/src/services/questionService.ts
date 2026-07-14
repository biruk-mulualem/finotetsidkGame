// services/questionService.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// ============================================
// TYPES
// ============================================

export interface Question {
  id: number;
  type: 'sign' | 'proverb' | 'choice' | 'truefalse' | 'short' | 'song';
  category: string;
  question: string;
  options?: string[];
  correct: string | number | boolean;
  answer?: string;
  image_url?: string;
  description?: string;
  audio_url?: string;
  difficulty: number;
  points: number;
  time_limit: number;
  is_active: boolean;
  is_weekly?: boolean;
  week_number?: number;
  year?: number;
  card_number?: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionType {
  type: string;
  count: number;
  emoji: string;
  name: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface QuestionFilters {
  type?: string;
  category?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: PaginationMeta;
  filters: QuestionFilters;
  count?: number;
  total?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  total?: number;
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

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
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
// QUESTION SERVICE
// ============================================

// Add a debounce map to prevent duplicate API calls
const pendingDeactivations = new Map<number, Promise<any>>();

const questionService = {
  /**
   * Get question types with counts (only active questions)
   * GET /api/questions/types
   */
  getQuestionTypes: async (): Promise<ApiResponse<QuestionType[]>> => {
    try {
      const response = await api.get<ApiResponse<QuestionType[]>>('/questions/types');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Get questions by type with pagination and search
   * GET /api/questions/type/:type
   */
  getQuestionsByType: async (
    type: string, 
    options?: {
      limit?: number;
      offset?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    }
  ): Promise<PaginatedResponse<Question>> => {
    try {
      const params = new URLSearchParams();
      if (options) {
        if (options.limit) params.append('limit', String(options.limit));
        if (options.offset !== undefined) params.append('offset', String(options.offset));
        if (options.search) params.append('search', options.search);
        if (options.sortBy) params.append('sortBy', options.sortBy);
        if (options.sortOrder) params.append('sortOrder', options.sortOrder);
      }
      
      const queryString = params.toString();
      const url = `/questions/type/${type}${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get<PaginatedResponse<Question>>(url);
      console.log(`📥 Received ${response.data?.data?.length || 0} questions for type ${type}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Get all questions with filters, pagination, and search
   * GET /api/questions
   */
  getQuestions: async (params?: {
    type?: string;
    category?: string;
    isActive?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<PaginatedResponse<Question>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });
      }
      
      const queryString = queryParams.toString();
      const url = `/questions${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get<PaginatedResponse<Question>>(url);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Get single question by ID
   * GET /api/questions/:id
   */
  getQuestion: async (id: number): Promise<ApiResponse<Question>> => {
    try {
      const response = await api.get<ApiResponse<Question>>(`/questions/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Create a new question (admin only)
   * POST /api/questions
   */
  createQuestion: async (questionData: Partial<Question>): Promise<ApiResponse<Question>> => {
    try {
      const response = await api.post<ApiResponse<Question>>('/questions', questionData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Update a question (admin only)
   * PUT /api/questions/:id
   */
  updateQuestion: async (id: number, questionData: Partial<Question>): Promise<ApiResponse<Question>> => {
    try {
      const response = await api.put<ApiResponse<Question>>(`/questions/${id}`, questionData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Delete a question (admin only)
   * DELETE /api/questions/:id
   */
  deleteQuestion: async (id: number): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete<ApiResponse<null>>(`/questions/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Mark a question as answered/deactivated (sets is_active to false)
   * PUT /api/questions/:id/deactivate
   * With debounce to prevent duplicate calls
   */
  deactivateQuestion: async (id: number): Promise<ApiResponse<Question>> => {
    // If there's already a pending deactivation for this ID, return that promise
    if (pendingDeactivations.has(id)) {
      console.log(`⏭️ Reusing pending deactivation for question ${id}`);
      return pendingDeactivations.get(id)!;
    }
    
    console.log(`🔴 Sending deactivate request for question ${id}`);
    
    const promise = (async () => {
      try {
        const response = await api.put<ApiResponse<Question>>(`/questions/${id}/deactivate`);
        console.log(`✅ Deactivate response for ${id}:`, response.data);
        return response.data;
      } catch (error: any) {
        console.error(`❌ Deactivate failed for ${id}:`, error);
        throw error.response?.data || { success: false, message: error.message };
      } finally {
        // Remove from pending map after completion
        pendingDeactivations.delete(id);
      }
    })();
    
    // Store the promise
    pendingDeactivations.set(id, promise);
    
    // Clean up after 5 seconds (in case the promise gets stuck)
    setTimeout(() => {
      if (pendingDeactivations.has(id)) {
        pendingDeactivations.delete(id);
      }
    }, 5000);
    
    return promise;
  },

  /**
   * Assign card numbers to questions (admin only)
   * PUT /api/questions/assign-card-numbers
   */
  assignCardNumbers: async (type?: string): Promise<ApiResponse<{ message: string; data: any[] }>> => {
    try {
      const queryParams = type ? `?type=${type}` : '';
      const response = await api.put<ApiResponse<{ message: string; data: any[] }>>(
        `/questions/assign-card-numbers${queryParams}`
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },
};

// ============================================
// CUSTOM HOOKS
// ============================================

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for fetching question types with counts
 */
export const useQuestionTypes = () => {
  const [types, setTypes] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTypes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await questionService.getQuestionTypes();
      setTypes(response.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch question types');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  return { types, loading, error, refetch: fetchTypes };
};

/**
 * Hook for fetching questions by type with pagination
 */
export const useQuestionsByType = (
  type?: string, 
  options?: {
    limit?: number;
    offset?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }
) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchQuestions = useCallback(async () => {
    if (!type) {
      setQuestions([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log(`🔄 Fetching questions for type: ${type}`);
      const response = await questionService.getQuestionsByType(type, options);
      console.log(`📥 Raw response: ${response.data?.length || 0} questions`);
      setQuestions(response.data || []);
      setTotal(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 0);
      setCurrentPage(response.pagination?.currentPage || 1);
      setError(null);
    } catch (err: any) {
      console.error('❌ Error fetching questions:', err);
      setError(err.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  }, [type, options]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return { 
    questions, 
    loading, 
    error, 
    total, 
    totalPages, 
    currentPage,
    refetch: fetchQuestions 
  };
};

/**
 * Hook for fetching all questions with pagination and search
 */
export const useQuestions = (initialFilters?: {
  type?: string;
  category?: string;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filters, setFilters] = useState<typeof initialFilters>(initialFilters || {});

  const fetchQuestions = useCallback(async (newFilters?: typeof initialFilters) => {
    const currentFilters = newFilters || filters;
    try {
      setLoading(true);
      const response = await questionService.getQuestions(currentFilters);
      setQuestions(response.data || []);
      setTotal(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 0);
      setCurrentPage(response.pagination?.currentPage || 1);
      setError(null);
    } catch (err: any) {
      console.error('❌ Error fetching questions:', err);
      setError(err.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const updateFilters = useCallback((newFilters: Partial<typeof initialFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const goToPage = useCallback((page: number) => {
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;
    updateFilters({ offset });
  }, [filters?.limit, updateFilters]);

  return { 
    questions, 
    loading, 
    error, 
    total, 
    totalPages, 
    currentPage,
    filters,
    updateFilters,
    goToPage,
    refetch: fetchQuestions 
  };
};

export default questionService;