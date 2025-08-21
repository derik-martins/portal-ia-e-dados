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
  bio?: string;
  profile_image?: string;
  banner_image?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  interests?: string[];
  skills?: string[];
  location?: string;
  phone?: string;
  ativo?: boolean;
  created_at: string;
  updated_at?: string;
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

// Interfaces para dicas
interface Dica {
  id: number;
  titulo: string;
  categoria: string;
  descricao_breve: string;
  conteudo: EditorContent;
  tempo_leitura: number;
  imagem_header?: string;
  tags: string[];
  autor_id: number;
  autor_nome: string;
  visualizacoes: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface EditorContent {
  time?: number;
  blocks: EditorBlock[];
  version?: string;
}

interface EditorBlock {
  id?: string;
  type: string;
  data: any;
}

interface DicaFormData {
  titulo: string;
  categoria: string;
  descricao_breve: string;
  conteudo: EditorContent;
  tempo_leitura: number;
  imagem_header: string;
  tags: string[];
}

interface DicaFilters {
  categoria?: string;
  tag?: string;
  busca?: string;
  limite?: number;
}

interface Categoria {
  categoria: string;
  total: number;
}

interface Tag {
  tag: string;
  total: number;
}

interface LoginData {
  user: User;
  token: string;
}

interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
}

interface UserListResponse {
  usuarios: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Interfaces para chat
interface Conversa {
  id: number;
  user_id: number;
  titulo: string;
  created_at: string;
  updated_at: string;
  ultima_mensagem?: string;
  total_mensagens?: number;
}

interface Mensagem {
  id: number;
  conversa_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ConversaCompleta {
  conversa: Conversa;
  mensagens: Mensagem[];
}

// Interfaces para insígnias
interface Insignia {
  id: number;
  nome: string;
  descricao?: string;
  imagem_url?: string;
  pontos: number;
  cor: string;
  ativo: boolean;
  created_at: string;
  updated_at?: string;
  total_usuarios?: number;
  data_conceicao?: string;
  observacoes?: string;
  concedida_por_nome?: string;
}

interface InsigniaFormData {
  nome: string;
  descricao?: string;
  imagem_url?: string;
  pontos: number;
  cor?: string;
}

interface ConcessaoInsignia {
  userId: number;
  insigniaId: number;
  observacoes?: string;
}

interface RankingUsuario {
  id: number;
  name: string;
  profile_image?: string;
  total_pontos: number;
  total_insignias: number;
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
    
    console.log(`Fazendo requisição ${config.method || 'GET'} para: ${url}`);
    console.log('Headers:', config.headers);
    
    if (config.body instanceof FormData) {
      console.log('Enviando FormData');
      // Remove Content-Type para FormData
      delete (config.headers as any)['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      console.log(`Resposta ${response.status}:`, data);
      
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

  // Métodos para perfil do usuário
  static async updateProfile(profileData: { 
    name: string; 
    bio?: string;
    linkedin_url?: string;
    github_url?: string;
    website_url?: string;
    interests?: string[];
    skills?: string[];
    location?: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  static async updateProfileImage(imageFile: File): Promise<ApiResponse<{ user: User; imageUrl: string }>> {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    
    console.log('Enviando imagem de perfil:', {
      name: imageFile.name, 
      size: imageFile.size, 
      type: imageFile.type
    });
    
    return this.request<{ user: User; imageUrl: string }>('/profile/image', {
      method: 'POST',
      body: formData,
    });
  }

  static async removeProfileImage(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/profile/image', {
      method: 'DELETE',
    });
  }

  static async updateBannerImage(imageFile: File): Promise<ApiResponse<{ user: User; imageUrl: string }>> {
    const formData = new FormData();
    formData.append('bannerImage', imageFile);
    
    console.log('Enviando imagem de banner:', {
      name: imageFile.name, 
      size: imageFile.size, 
      type: imageFile.type
    });
    
    return this.request<{ user: User; imageUrl: string }>('/profile/banner', {
      method: 'POST',
      body: formData,
    });
  }

  static async removeBannerImage(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/profile/banner', {
      method: 'DELETE',
    });
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

  static async atualizarEventosSimilares(id: number, evento: Omit<Evento, 'id' | 'created_by' | 'created_by_name' | 'created_at' | 'updated_at'> & { updateSimilar: boolean }): Promise<ApiResponse<{ eventos: Evento[] }>> {
    return this.request<{ eventos: Evento[] }>(`/eventos/${id}/similar`, {
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

  // Métodos para dicas
  static async buscarDicas(filtros?: DicaFilters): Promise<ApiResponse<Dica[]>> {
    const params = new URLSearchParams();
    if (filtros?.categoria) params.append('categoria', filtros.categoria);
    if (filtros?.tag) params.append('tag', filtros.tag);
    if (filtros?.busca) params.append('busca', filtros.busca);
    if (filtros?.limite) params.append('limite', filtros.limite.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Dica[]>(`/dicas${query}`);
  }

  static async buscarDicaPorId(id: number): Promise<ApiResponse<Dica>> {
    return this.request<Dica>(`/dicas/${id}`);
  }

  static async criarDica(dica: DicaFormData): Promise<ApiResponse<Dica>> {
    return this.request<Dica>('/dicas', {
      method: 'POST',
      body: JSON.stringify(dica),
    });
  }

  static async atualizarDica(id: number, dica: DicaFormData): Promise<ApiResponse<Dica>> {
    return this.request<Dica>(`/dicas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dica),
    });
  }

  static async excluirDica(id: number): Promise<ApiResponse> {
    return this.request(`/dicas/${id}`, {
      method: 'DELETE',
    });
  }

  static async buscarMinhasDicas(): Promise<ApiResponse<Dica[]>> {
    return this.request<Dica[]>('/dicas/usuario/minhas');
  }

  static async buscarCategoriasDicas(): Promise<ApiResponse<Categoria[]>> {
    return this.request<Categoria[]>('/dicas/categorias');
  }

  static async buscarTagsDicas(): Promise<ApiResponse<Tag[]>> {
    return this.request<Tag[]>('/dicas/tags');
  }

  // Métodos para administração de usuários (apenas admins)
  static async listarUsuarios(page: number = 1, limit: number = 10): Promise<ApiResponse<UserListResponse>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    return this.request<UserListResponse>(`/admin/usuarios?${params.toString()}`);
  }

  static async criarUsuario(userData: UserFormData): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/admin/usuarios', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async atualizarUsuario(id: number, userData: Omit<UserFormData, 'password'>): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>(`/admin/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  static async alterarStatusUsuario(id: number, ativo: boolean): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>(`/admin/usuarios/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ ativo }),
    });
  }

  static async excluirUsuario(id: number): Promise<ApiResponse> {
    return this.request(`/admin/usuarios/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para chat
  static async listarConversas(): Promise<ApiResponse<Conversa[]>> {
    return this.request<Conversa[]>('/chat/conversas');
  }

  static async criarConversa(mensagem: string): Promise<ApiResponse<ConversaCompleta>> {
    return this.request<ConversaCompleta>('/chat/conversas', {
      method: 'POST',
      body: JSON.stringify({ mensagem }),
    });
  }

  static async buscarConversa(id: number): Promise<ApiResponse<ConversaCompleta>> {
    return this.request<ConversaCompleta>(`/chat/conversas/${id}`);
  }

  static async enviarMensagem(conversaId: number, mensagem: string): Promise<ApiResponse<{ mensagens: Mensagem[] }>> {
    return this.request<{ mensagens: Mensagem[] }>(`/chat/conversas/${conversaId}/mensagens`, {
      method: 'POST',
      body: JSON.stringify({ mensagem }),
    });
  }

  static async deletarConversa(id: number): Promise<ApiResponse> {
    return this.request(`/chat/conversas/${id}`, {
      method: 'DELETE',
    });
  }

  static async atualizarTituloConversa(id: number, titulo: string): Promise<ApiResponse<Conversa>> {
    return this.request<Conversa>(`/chat/conversas/${id}/titulo`, {
      method: 'PUT',
      body: JSON.stringify({ titulo }),
    });
  }

  // Métodos para usuários (públicos)
  static async listarTodosUsuarios(page: number = 1, limit: number = 12, search?: string): Promise<ApiResponse<{ usuarios: User[], pagination: any }>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    
    return this.request<{ usuarios: User[], pagination: any }>(`/users?${params.toString()}`);
  }

  static async buscarUsuarioPorId(id: number): Promise<ApiResponse<{ usuario: User }>> {
    return this.request<{ usuario: User }>(`/users/${id}`);
  }

  static async buscarUsuariosPorSkill(skill: string): Promise<ApiResponse<{ usuarios: User[] }>> {
    const params = new URLSearchParams();
    params.append('skill', skill);
    
    return this.request<{ usuarios: User[] }>(`/users/buscar?${params.toString()}`);
  }

  static async buscarUsuariosPorInteresse(interesse: string): Promise<ApiResponse<{ usuarios: User[] }>> {
    const params = new URLSearchParams();
    params.append('interesse', interesse);
    
    return this.request<{ usuarios: User[] }>(`/users/buscar?${params.toString()}`);
  }

  static async listarSkillsPopulares(): Promise<ApiResponse<{ skills: Array<{ skill: string, count: number }> }>> {
    return this.request<{ skills: Array<{ skill: string, count: number }> }>('/users/skills-populares');
  }

  static async listarInteressesPopulares(): Promise<ApiResponse<{ interesses: Array<{ interesse: string, count: number }> }>> {
    return this.request<{ interesses: Array<{ interesse: string, count: number }> }>('/users/interesses-populares');
  }

  // Métodos para insígnias (admin)
  static async listarInsignias(apenasAtivas: boolean = true): Promise<ApiResponse<{ insignias: Insignia[] }>> {
    const params = new URLSearchParams();
    if (!apenasAtivas) params.append('ativas', 'false');
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ insignias: Insignia[] }>(`/insignias${query}`);
  }

  static async buscarInsigniaPorId(id: number): Promise<ApiResponse<{ insignia: Insignia }>> {
    return this.request<{ insignia: Insignia }>(`/insignias/${id}`);
  }

  static async criarInsignia(dadosInsignia: InsigniaFormData): Promise<ApiResponse<{ insignia: Insignia }>> {
    return this.request<{ insignia: Insignia }>('/insignias', {
      method: 'POST',
      body: JSON.stringify(dadosInsignia),
    });
  }

  static async atualizarInsignia(id: number, dadosInsignia: InsigniaFormData & { ativo?: boolean }): Promise<ApiResponse<{ insignia: Insignia }>> {
    return this.request<{ insignia: Insignia }>(`/insignias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dadosInsignia),
    });
  }

  static async deletarInsignia(id: number): Promise<ApiResponse> {
    return this.request(`/insignias/${id}`, {
      method: 'DELETE',
    });
  }

  static async concederInsignia(concessao: ConcessaoInsignia): Promise<ApiResponse> {
    return this.request('/insignias/conceder', {
      method: 'POST',
      body: JSON.stringify(concessao),
    });
  }

  static async removerInsigniaUsuario(userId: number, insigniaId: number): Promise<ApiResponse> {
    return this.request(`/insignias/usuario/${userId}/insignia/${insigniaId}`, {
      method: 'DELETE',
    });
  }

  // Métodos públicos para insígnias
  static async listarInsigniasUsuario(userId: number): Promise<ApiResponse<{ insignias: Insignia[], total_pontos: number }>> {
    return this.request<{ insignias: Insignia[], total_pontos: number }>(`/insignias/usuario/${userId}`);
  }

  static async rankingUsuarios(limite: number = 10): Promise<ApiResponse<{ ranking: RankingUsuario[] }>> {
    const params = new URLSearchParams();
    params.append('limite', limite.toString());
    
    return this.request<{ ranking: RankingUsuario[] }>(`/insignias/ranking?${params.toString()}`);
  }
}

export default ApiService;
export type { 
  User, 
  LoginData, 
  ApiResponse, 
  Noticia, 
  Evento, 
  Dica, 
  EditorContent, 
  EditorBlock, 
  DicaFormData, 
  DicaFilters, 
  Categoria, 
  Tag,
  UserFormData,
  UserListResponse,
  Conversa,
  Mensagem,
  ConversaCompleta,
  Insignia,
  InsigniaFormData,
  ConcessaoInsignia,
  RankingUsuario
};
