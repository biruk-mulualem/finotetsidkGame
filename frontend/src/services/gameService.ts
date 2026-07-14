// services/gameSessionService.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// ============================================
// TYPES
// ============================================

export interface SessionTeam {
  id: number;
  team_id: number;
  team_name: string;
  team_emoji: string;
  score: number;
}

export interface SessionQuestion {
  id: number;
  question_id: number;
  answered: boolean;
  is_correct: boolean;
  team_index: number;
  points_earned: number;
  time_taken: number;
  question?: Question;
}

export interface Session {
  id: number;
  question_type: string;
  status: 'waiting' | 'active' | 'completed';
  total_questions: number;
  current_question_index: number;
  current_team_index: number;
  started_at: string;
  completed_at: string | null;
  teams: SessionTeam[];
  questions: SessionQuestion[];
}

export interface Question {
  id: number;
  type: string;
  category: string;
  question: string;
  options?: string[];
  correct: string | number | boolean;
  answer?: string;
  image_url?: string;
  description?: string;
  audio_url?: string;
  points: number;
  time_limit: number;
}

export interface StartSessionData {
  teamIds: number[];
  questionType: string;
  totalQuestions?: number;
}

export interface SubmitAnswerData {
  questionIndex: number;
  teamIndex: number;
  isCorrect: boolean;
  pointsEarned?: number;
  timeTaken?: number;
}

export interface RevealAnswerData {
  questionIndex: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
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
// GAME SESSION SERVICE
// ============================================

const gameSessionService = {
  /**
   * Start a new game session
   * POST /api/game/session
   */
  startSession: async (data: StartSessionData): Promise<ApiResponse<Session>> => {
    try {
      const response = await api.post<ApiResponse<Session>>('/game/session', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Get current question
   * GET /api/game/session/:sessionId/current
   */
  getCurrentQuestion: async (sessionId: number): Promise<ApiResponse<{
    session: Session;
    question: SessionQuestion | null;
    questionIndex: number;
    currentTeam: SessionTeam | null;
    totalQuestions: number;
    answeredQuestions: number;
    allCompleted: boolean;
  }>> => {
    try {
      const response = await api.get(`/game/session/${sessionId}/current`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Get session status
   * GET /api/game/session/:sessionId/status
   */
  getSessionStatus: async (sessionId: number): Promise<ApiResponse<{
    session: Session;
    progress: { answered: number; total: number; percentage: number };
    currentTeam: SessionTeam | null;
    nextQuestionIndex: number;
    nextQuestion: SessionQuestion | null;
    isComplete: boolean;
    teams: SessionTeam[];
  }>> => {
    try {
      const response = await api.get(`/game/session/${sessionId}/status`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Submit answer
   * POST /api/game/session/:sessionId/answer
   */
  submitAnswer: async (
    sessionId: number,
    data: SubmitAnswerData
  ): Promise<ApiResponse<{
    session: Session;
    allCompleted: boolean;
    questionIndex: number;
    teamIndex: number;
    isCorrect: boolean;
    pointsEarned: number;
  }>> => {
    try {
      const response = await api.post(`/game/session/${sessionId}/answer`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Reveal answer (no points)
   * POST /api/game/session/:sessionId/reveal
   */
  revealAnswer: async (
    sessionId: number,
    data: RevealAnswerData
  ): Promise<ApiResponse<{
    session: Session;
    allCompleted: boolean;
    questionIndex: number;
    revealed: boolean;
  }>> => {
    try {
      const response = await api.post(`/game/session/${sessionId}/reveal`, data);
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
 * Hook for managing a game session
 */
export const useGameSession = (sessionId?: number) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<SessionQuestion | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1);
  const [currentTeam, setCurrentTeam] = useState<SessionTeam | null>(null);
  const [teams, setTeams] = useState<SessionTeam[]>([]);
  const [progress, setProgress] = useState({ answered: 0, total: 0, percentage: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCurrentQuestion = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const response = await gameSessionService.getCurrentQuestion(id);
      if (response.success && response.data) {
        const data = response.data;
        setSession(data.session);
        setCurrentQuestion(data.question);
        setCurrentQuestionIndex(data.questionIndex);
        setCurrentTeam(data.currentTeam);
        setTeams(data.session.teams || []);
        setProgress({
          answered: data.answeredQuestions,
          total: data.totalQuestions,
          percentage: data.totalQuestions > 0 
            ? Math.round((data.answeredQuestions / data.totalQuestions) * 100) 
            : 0,
        });
        setIsComplete(data.allCompleted);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  }, []);

  const startSession = useCallback(async (data: StartSessionData) => {
    try {
      setLoading(true);
      const response = await gameSessionService.startSession(data);
      if (response.success && response.data) {
        const session = response.data;
        setSession(session);
        return session;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(async (data: SubmitAnswerData) => {
    if (!session) throw new Error('No active session');
    try {
      setLoading(true);
      const response = await gameSessionService.submitAnswer(session.id, data);
      if (response.success && response.data) {
        const { session: updatedSession, allCompleted } = response.data;
        setSession(updatedSession);
        setIsComplete(allCompleted);
        
        // Update teams
        if (updatedSession.teams) {
          setTeams(updatedSession.teams);
          const team = updatedSession.teams[updatedSession.current_team_index];
          setCurrentTeam(team || null);
        }
        
        // Update progress
        const answered = updatedSession.questions.filter(q => q.answered).length;
        const total = updatedSession.questions.length;
        setProgress({
          answered,
          total,
          percentage: total > 0 ? Math.round((answered / total) * 100) : 0,
        });
        
        return response.data;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session]);

  const revealAnswer = useCallback(async (data: RevealAnswerData) => {
    if (!session) throw new Error('No active session');
    try {
      setLoading(true);
      const response = await gameSessionService.revealAnswer(session.id, data);
      if (response.success && response.data) {
        const { session: updatedSession, allCompleted } = response.data;
        setSession(updatedSession);
        setIsComplete(allCompleted);
        
        // Update teams
        if (updatedSession.teams) {
          setTeams(updatedSession.teams);
          const team = updatedSession.teams[updatedSession.current_team_index];
          setCurrentTeam(team || null);
        }
        
        // Update progress
        const answered = updatedSession.questions.filter(q => q.answered).length;
        const total = updatedSession.questions.length;
        setProgress({
          answered,
          total,
          percentage: total > 0 ? Math.round((answered / total) * 100) : 0,
        });
        
        return response.data;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reveal answer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session]);

  const nextQuestion = useCallback(async () => {
    if (!session) throw new Error('No active session');
    await loadCurrentQuestion(session.id);
  }, [session, loadCurrentQuestion]);

  useEffect(() => {
    if (sessionId) {
      loadCurrentQuestion(sessionId);
    }
  }, [sessionId, loadCurrentQuestion]);

  return {
    session,
    currentQuestion,
    currentQuestionIndex,
    currentTeam,
    teams,
    progress,
    isComplete,
    loading,
    error,
    startSession,
    loadCurrentQuestion,
    submitAnswer,
    revealAnswer,
    nextQuestion,
  };
};

export default gameSessionService;