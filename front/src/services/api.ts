// Configuração da API base
const getApiUrl = (): string => {
  // Em desenvolvimento (Vite dev server), usar o backend direto
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }
  
  // Em produção (Docker com nginx), usar URL relativa
  // O nginx fará o proxy para o backend automaticamente
  return '/api';
};

const API_BASE_URL = getApiUrl();

// Interface para respostas da API
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

// Interface para dados do usuário
interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

// Interface para notícias
interface Noticia {
  id: number;
  titulo: string;
  fonte: string;
  data: string;
  tags: string[];
  url: string;
}

// Interface para eventos
interface Evento {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  event_type: 'aula' | 'evento' | 'feriado' | 'prova';
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at?: string;
}

interface LoginData {
  user: User;
  token: string;
}

// Classe para gerenciar requisições à API
class ApiService {
  private static async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Adicionar token se estiver disponível
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        console.error(`API Error (${response.status}):`, data);
      }
      
      return data;
    } catch (error) {
      console.error('Network error:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor',
      };
    }
  }

  static async login(email: string, password: string): Promise<ApiResponse<LoginData>> {
    return this.request<LoginData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(email: string, password: string, name: string): Promise<ApiResponse<LoginData>> {
    return this.request<LoginData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  static async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/profile');
  }

  static async checkHealth(): Promise<ApiResponse> {
    // Em desenvolvimento, usar URL completa
    // Em produção, usar URL relativa (nginx fará o proxy)
    const url = import.meta.env.DEV 
      ? (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace('/api', '/health')
      : '/health';
      
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Servidor indisponível',
      };
    }
  }

  // Métodos para notícias
  static async buscarNoticiasPorCategoria(): Promise<ApiResponse<{ ia: Noticia[], dados: Noticia[] }>> {
    return this.request<{ ia: Noticia[], dados: Noticia[] }>('/noticias/categorias');
  }

  static async buscarNoticias(categoria?: string, limite?: number): Promise<ApiResponse<Noticia[]>> {
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    if (limite) params.append('limite', limite.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Noticia[]>(`/noticias${query}`);
  }

  static async atualizarFeeds(): Promise<ApiResponse> {
    return this.request('/noticias/atualizar-feeds', {
      method: 'POST',
    });
  }

  // Métodos para eventos
  static async buscarEventos(startDate?: string, endDate?: string): Promise<ApiResponse<{ eventos: Evento[] }>> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ eventos: Evento[] }>(`/eventos${query}`);
  }

  static async buscarEventoPorId(id: number): Promise<ApiResponse<{ evento: Evento }>> {
    return this.request<{ evento: Evento }>(`/eventos/${id}`);
  }

  static async criarEvento(evento: Omit<Evento, 'id' | 'created_by' | 'created_by_name' | 'created_at' | 'updated_at'>): Promise<ApiResponse<{ evento: Evento }>> {
    return this.request<{ evento: Evento }>('/eventos', {
      method: 'POST',
      body: JSON.stringify(evento),
    });
  }

  static async atualizarEvento(id: number, evento: Omit<Evento, 'id' | 'created_by' | 'created_by_name' | 'created_at' | 'updated_at'>): Promise<ApiResponse<{ evento: Evento }>> {
    return this.request<{ evento: Evento }>(`/eventos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(evento),
    });
  }

  static async deletarEvento(id: number): Promise<ApiResponse> {
    return this.request(`/eventos/${id}`, {
      method: 'DELETE',
    });
  }

  static async criarAulasRecorrentes(): Promise<ApiResponse<{ eventos: Evento[] }>> {
    return this.request<{ eventos: Evento[] }>('/eventos/recurring/classes', {
      method: 'POST',
    });
  }
}

export default ApiService;
export type { User, LoginData, ApiResponse, Noticia, Evento };
