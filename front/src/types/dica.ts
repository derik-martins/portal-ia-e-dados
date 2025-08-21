export interface Dica {
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

export interface EditorContent {
  time?: number;
  blocks: EditorBlock[];
  version?: string;
}

export interface EditorBlock {
  id?: string;
  type: string;
  data: any;
}

export interface DicaFormData {
  titulo: string;
  categoria: string;
  descricao_breve: string;
  conteudo: EditorContent;
  tempo_leitura: number;
  imagem_header: string;
  tags: string[];
}

export interface DicaFilters {
  categoria?: string;
  tag?: string;
  busca?: string;
  limite?: number;
}

export interface Categoria {
  categoria: string;
  total: number;
}

export interface Tag {
  tag: string;
  total: number;
}
