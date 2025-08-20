const Parser = require('rss-parser');
const axios = require('axios');
const NoticiaModel = require('../models/NoticiaModel');

class RSSService {
  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['category', 'categories']
      }
    });
    
    this.feeds = [
      {
        url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
        fonte: 'TechCrunch',
        categoria: 'ia',
        idioma: 'en'
      },
      {
        url: 'https://www.wired.com/feed/tag/ai/latest/rss',
        fonte: 'Wired',
        categoria: 'ia',
        idioma: 'en'
      },
      {
        url: 'https://research.google/blog/rss/',
        fonte: 'Google Research',
        categoria: 'ia',
        idioma: 'en'
      },
      {
        url: 'https://mittechreview.com.br/feed/',
        fonte: 'MIT Technology Review BR',
        categoria: 'dados',
        idioma: 'en'
      },
      {
        url: 'https://institutocaldeira.org.br/blog/feed/',
        fonte: 'Instituto Caldeira',
        categoria: 'dados',
        idioma: 'pt'
      }
    ];
  }

  async traduzirTexto(texto, idiomaOrigem = 'en') {
    if (idiomaOrigem === 'pt' || !texto) return texto;
    
    try {
      // Tradução básica de termos técnicos comuns
      const traducoes = {
        'AI': 'IA',
        'Artificial Intelligence': 'Inteligência Artificial',
        'Machine Learning': 'Aprendizado de Máquina',
        'Deep Learning': 'Aprendizado Profundo',
        'Data Science': 'Ciência de Dados',
        'Big Data': 'Big Data',
        'Neural Network': 'Rede Neural',
        'Algorithm': 'Algoritmo',
        'Database': 'Banco de Dados',
        'Cloud Computing': 'Computação em Nuvem',
        'Software': 'Software',
        'Hardware': 'Hardware',
        'Technology': 'Tecnologia',
        'Innovation': 'Inovação',
        'Research': 'Pesquisa',
        'Development': 'Desenvolvimento',
        'Programming': 'Programação',
        'Coding': 'Codificação',
        'Analytics': 'Análise',
        'Breakthrough': 'Avanço',
        'Performance': 'Desempenho',
        'Integration': 'Integração',
        'Platform': 'Plataforma',
        'Framework': 'Framework',
        'API': 'API',
        'Security': 'Segurança',
        'Privacy': 'Privacidade',
        'Automation': 'Automação',
        'Optimization': 'Otimização'
      };
      
      let textoTraduzido = texto;
      
      // Aplicar traduções básicas
      Object.entries(traducoes).forEach(([ingles, portugues]) => {
        const regex = new RegExp(`\\b${ingles}\\b`, 'gi');
        textoTraduzido = textoTraduzido.replace(regex, portugues);
      });
      
      return textoTraduzido;
    } catch (error) {
      console.error('Erro na tradução:', error);
      return texto;
    }
  }

  extrairTags(item, categoria) {
    const tags = [];
    
    // Tags baseadas na categoria
    if (categoria === 'ia') {
      tags.push('Inteligência Artificial');
    } else if (categoria === 'dados') {
      tags.push('Dados');
    }
    
    // Tags do RSS feed
    if (item.categories && Array.isArray(item.categories)) {
      item.categories.forEach(cat => {
        if (typeof cat === 'string' && cat.length > 0) {
          tags.push(cat);
        }
      });
    }
    
    if (item.category && typeof item.category === 'string') {
      tags.push(item.category);
    }
    
    // Tags baseadas no conteúdo do título
    const titulo = item.title.toLowerCase();
    if (titulo.includes('machine learning') || titulo.includes('ml')) tags.push('Machine Learning');
    if (titulo.includes('deep learning')) tags.push('Deep Learning');
    if (titulo.includes('chatgpt') || titulo.includes('gpt')) tags.push('GPT');
    if (titulo.includes('google')) tags.push('Google');
    if (titulo.includes('openai')) tags.push('OpenAI');
    if (titulo.includes('data')) tags.push('Big Data');
    if (titulo.includes('python')) tags.push('Python');
    if (titulo.includes('spark')) tags.push('Apache Spark');
    
    return [...new Set(tags)]; // Remove duplicatas
  }

  async processarFeed(feedConfig) {
    try {
      console.log(`Processando feed: ${feedConfig.fonte}`);
      const feed = await this.parser.parseURL(feedConfig.url);
      
      const noticias = [];
      
      for (const item of feed.items.slice(0, 10)) { // Pega apenas as 10 mais recentes
        try {
          const tags = this.extrairTags(item, feedConfig.categoria);
          
          const noticia = {
            titulo: await this.traduzirTexto(item.title, feedConfig.idioma),
            titulo_original: item.title,
            descricao: await this.traduzirTexto(item.contentSnippet || item.summary, feedConfig.idioma),
            descricao_original: item.contentSnippet || item.summary,
            fonte: feedConfig.fonte,
            url: item.link,
            data_publicacao: new Date(item.pubDate || item.isoDate),
            categoria: feedConfig.categoria,
            tags: tags
          };
          
          await NoticiaModel.salvarNoticia(noticia);
          noticias.push(noticia);
          
        } catch (error) {
          console.error(`Erro ao processar item do feed ${feedConfig.fonte}:`, error);
        }
      }
      
      console.log(`Feed ${feedConfig.fonte} processado: ${noticias.length} notícias`);
      return noticias;
      
    } catch (error) {
      console.error(`Erro ao processar feed ${feedConfig.fonte}:`, error);
      return [];
    }
  }

  async atualizarTodosFeeds() {
    console.log('Iniciando atualização de todos os feeds RSS...');
    
    const resultados = [];
    
    for (const feedConfig of this.feeds) {
      try {
        const noticias = await this.processarFeed(feedConfig);
        resultados.push({
          fonte: feedConfig.fonte,
          sucesso: true,
          quantidade: noticias.length
        });
      } catch (error) {
        console.error(`Erro no feed ${feedConfig.fonte}:`, error);
        resultados.push({
          fonte: feedConfig.fonte,
          sucesso: false,
          erro: error.message
        });
      }
    }
    
    console.log('Atualização de feeds concluída:', resultados);
    return resultados;
  }
}

module.exports = new RSSService();