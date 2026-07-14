// services/teamsService.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// ============================================
// TYPES
// ============================================

export interface Team {
  id: number;
  team1_name: string;
  team1_emoji: string;
  team1_color: string;
  team1_score: number;
  team1_wins: number;
  team1_losses: number;
  team1_total_points: number;
  team1_games_played: number;
  team2_name: string;
  team2_emoji: string;
  team2_color: string;
  team2_score: number;
  team2_wins: number;
  team2_losses: number;
  team2_total_points: number;
  team2_games_played: number;
  is_active: boolean;
  game_date: string;
  week_number: number | null;
  created_at: string;
}

export interface TeamDisplay {
  name: string;
  emoji: string;
  color: string;
  score: number;
  wins: number;
  losses: number;
  total_points: number;
  games_played: number;
}

export interface GameDisplay {
  id: number;
  match: string;
  score: string;
  team1: TeamDisplay;
  team2: TeamDisplay;
  is_active: boolean;
  week_number: number | null;
  game_date: string;
  winner: string;
}

export interface Winner {
  team: number;
  name: string;
  emoji: string;
  score: number;
}

export interface GameCreateData {
  team1_name: string;
  team1_emoji?: string;
  team1_color?: string;
  team2_name: string;
  team2_emoji?: string;
  team2_color?: string;
  week_number?: number;
}

export interface ScoreUpdateData {
  team1_score?: number;
  team2_score?: number;
}

export interface LeaderboardEntry {
  name: string;
  emoji: string;
  color: string;
  wins: number;
  losses: number;
  total_points: number;
  games_played: number;
  rounds?: number;
  draws?: number;
}

export interface GameHistoryItem extends Team {
  winner: {
    team: number;
    name: string;
    score: number;
    emoji?: string;
  };
  match: string;
  score: string;
}

export interface GameStats {
  totalRounds: number;
  activeRounds: number;
  completedRounds: number;
  totalQuestions: number;
  activeQuestions: number;
  processedQuestions: number;
  totalPoints: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  total?: number;
}

export interface GetTeamsParams {
  is_active?: boolean;
  week_number?: number;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface GetHistoryParams {
  limit?: number;
  offset?: number;
  week_number?: number;
  search?: string;
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

console.log('🔗 API_URL:', API_URL);

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
// TEAMS SERVICE
// ============================================

const teamsService = {
  /**
   * Get all teams (games) with pagination, search, and filters
   * GET /api/teams
   */
  getAllTeams: async (params?: GetTeamsParams): Promise<ApiResponse<Team[]>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }
      const response = await api.get<ApiResponse<Team[]>>(`/teams?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Get active game
   * GET /api/teams/active
   */
  getActiveGame: async (): Promise<ApiResponse<Team>> => {
    try {
      const response = await api.get<ApiResponse<Team>>('/teams/active');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Get single game by ID
   * GET /api/teams/:id
   */
  getGameById: async (id: number): Promise<ApiResponse<Team>> => {
    try {
      const response = await api.get<ApiResponse<Team>>(`/teams/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Create a new game with two teams
   * POST /api/teams
   */
  createGame: async (gameData: GameCreateData): Promise<ApiResponse<Team>> => {
    try {
      const response = await api.post<ApiResponse<Team>>('/teams', gameData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Update game scores
   * PUT /api/teams/:id/scores
   */
  updateScores: async (id: number, scoreData: ScoreUpdateData): Promise<ApiResponse<Team>> => {
    try {
      const response = await api.put<ApiResponse<Team>>(`/teams/${id}/scores`, scoreData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Complete a game (calculate winner, update stats)
   * PUT /api/teams/:id/complete
   */
  completeGame: async (id: number): Promise<ApiResponse<Team & { winner: Winner }>> => {
    try {
      const response = await api.put<ApiResponse<Team & { winner: Winner }>>(`/teams/${id}/complete`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Get game history with pagination and search
   * GET /api/teams/history
   */
  getGameHistory: async (params?: GetHistoryParams): Promise<ApiResponse<GameHistoryItem[]>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }
      const response = await api.get<ApiResponse<GameHistoryItem[]>>(`/teams/history?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Get leaderboard
   * GET /api/teams/leaderboard
   */
  getLeaderboard: async (limit: number = 10): Promise<ApiResponse<LeaderboardEntry[]>> => {
    try {
      const response = await api.get<ApiResponse<LeaderboardEntry[]>>(`/teams/leaderboard?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Get weekly leaderboard
   * GET /api/teams/leaderboard/week/:weekNumber
   */
  getWeeklyLeaderboard: async (weekNumber: number, limit: number = 10): Promise<ApiResponse<LeaderboardEntry[]>> => {
    try {
      const response = await api.get<ApiResponse<LeaderboardEntry[]>>(`/teams/leaderboard/week/${weekNumber}?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Delete a game
   * DELETE /api/teams/:id
   */
  deleteGame: async (id: number): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete<ApiResponse<null>>(`/teams/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Deactivate all active games
   * PUT /api/teams/deactivate/all
   */
  deactivateAllGames: async (): Promise<ApiResponse<null>> => {
    try {
      const response = await api.put<ApiResponse<null>>('/teams/deactivate/all');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  /**
   * Get game stats summary
   * GET /api/teams/stats
   */
  getGameStats: async (): Promise<ApiResponse<GameStats>> => {
    try {
      const response = await api.get<ApiResponse<GameStats>>('/teams/stats');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  // ============================================
  // HELPER METHODS
  // ============================================

  formatGameDisplay: (game: Team): GameDisplay => {
    const winner = game.team1_score > game.team2_score ? game.team1_name :
                   game.team2_score > game.team1_score ? game.team2_name : 'Draw';
    
    return {
      id: game.id,
      match: `${game.team1_name} vs ${game.team2_name}`,
      score: `${game.team1_score} - ${game.team2_score}`,
      team1: {
        name: game.team1_name,
        emoji: game.team1_emoji,
        color: game.team1_color,
        score: game.team1_score,
        wins: game.team1_wins,
        losses: game.team1_losses,
        total_points: game.team1_total_points,
        games_played: game.team1_games_played,
      },
      team2: {
        name: game.team2_name,
        emoji: game.team2_emoji,
        color: game.team2_color,
        score: game.team2_score,
        wins: game.team2_wins,
        losses: game.team2_losses,
        total_points: game.team2_total_points,
        games_played: game.team2_games_played,
      },
      is_active: game.is_active,
      week_number: game.week_number,
      game_date: game.game_date,
      winner,
    };
  },

  getTeamNames: (game: Team): { team1: string; team2: string } => {
    return {
      team1: game.team1_name,
      team2: game.team2_name,
    };
  },

  getTeamScores: (game: Team): { team1: number; team2: number } => {
    return {
      team1: game.team1_score,
      team2: game.team2_score,
    };
  },

  isGameCompleted: (game: Team): boolean => {
    return !game.is_active;
  },

  getWinner: (game: Team): Winner => {
    if (game.team1_score > game.team2_score) {
      return {
        team: 1,
        name: game.team1_name,
        emoji: game.team1_emoji,
        score: game.team1_score,
      };
    } else if (game.team2_score > game.team1_score) {
      return {
        team: 2,
        name: game.team2_name,
        emoji: game.team2_emoji,
        score: game.team2_score,
      };
    } else {
      return {
        team: 0,
        name: 'Draw',
        emoji: '🤝',
        score: game.team1_score,
      };
    }
  },

  getTeams: (game: Team): { team1: TeamDisplay; team2: TeamDisplay } => {
    return {
      team1: {
        name: game.team1_name,
        emoji: game.team1_emoji,
        color: game.team1_color,
        score: game.team1_score,
        wins: game.team1_wins,
        losses: game.team1_losses,
        total_points: game.team1_total_points,
        games_played: game.team1_games_played,
      },
      team2: {
        name: game.team2_name,
        emoji: game.team2_emoji,
        color: game.team2_color,
        score: game.team2_score,
        wins: game.team2_wins,
        losses: game.team2_losses,
        total_points: game.team2_total_points,
        games_played: game.team2_games_played,
      },
    };
  },

  getCurrentWeek: (): number => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = (now.getTime() - start.getTime()) + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000;
    return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
  },
};

// ============================================
// CUSTOM HOOKS
// ============================================

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for fetching teams/games with pagination
 */
export const useTeams = (params?: GetTeamsParams) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await teamsService.getAllTeams(params);
      setTeams(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / (params?.limit || 10)));
      setCurrentPage(Math.floor((params?.offset || 0) / (params?.limit || 10)) + 1);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return { teams, loading, error, total, totalPages, currentPage, refetch: fetchTeams };
};

/**
 * Hook for fetching active game
 */
export const useActiveGame = () => {
  const [game, setGame] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveGame = useCallback(async () => {
    try {
      setLoading(true);
      const response = await teamsService.getActiveGame();
      setGame(response.data || null);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch active game');
      setGame(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveGame();
  }, [fetchActiveGame]);

  return { game, loading, error, refetch: fetchActiveGame };
};

/**
 * Hook for fetching game history with pagination
 */
export const useGameHistory = (params?: GetHistoryParams) => {
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await teamsService.getGameHistory(params);
      setHistory(response.data || []);
      setTotal(response.total || 0);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch game history');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error, total, refetch: fetchHistory };
};

/**
 * Hook for fetching leaderboard
 */
export const useLeaderboard = (limit: number = 10) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await teamsService.getLeaderboard(limit);
      setLeaderboard(response.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { leaderboard, loading, error, refetch: fetchLeaderboard };
};

/**
 * Hook for creating a game
 */
export const useCreateGame = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createGame = useCallback(async (gameData: GameCreateData) => {
    try {
      setLoading(true);
      const response = await teamsService.createGame(gameData);
      setError(null);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to create game');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createGame, loading, error };
};

/**
 * Hook for updating scores
 */
export const useUpdateScores = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateScores = useCallback(async (id: number, scoreData: ScoreUpdateData) => {
    try {
      setLoading(true);
      const response = await teamsService.updateScores(id, scoreData);
      setError(null);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to update scores');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateScores, loading, error };
};

/**
 * Hook for completing a game
 */
export const useCompleteGame = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const completeGame = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const response = await teamsService.completeGame(id);
      setError(null);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to complete game');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { completeGame, loading, error };
};

/**
 * Hook for game stats
 */
export const useGameStats = () => {
  const [stats, setStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await teamsService.getGameStats();
      setStats(response.data || null);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch game stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

export default teamsService;