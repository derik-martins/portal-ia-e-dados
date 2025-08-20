const NoticiaModel = require('../models/NoticiaModel');
const rssService = require('../services/rssService');

class NoticiaController {
  static async buscarNoticias(req, res) {
    try {
      const { categoria, limite } = req.query;
      
      const noticias = await NoticiaModel.buscarNoticias(categoria, parseInt(limite) || 20);
      
      // Formatar as notícias para o frontend
      const noticiasFormatadas = noticias.map(noticia => ({
        id: noticia.id,
        titulo: noticia.titulo,
        fonte: noticia.fonte,
        data: noticia.data_publicacao,
        tags: noticia.tags || [],
        url: noticia.url
      }));
      
      res.json({
        success: true,
        data: noticiasFormatadas
      });
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }

  static async buscarNoticiasPorCategoria(req, res) {
    try {
      const ia = await NoticiaModel.buscarNoticias('ia', 8);
      const dados = await NoticiaModel.buscarNoticias('dados', 8);
      
      const formatarNoticias = (noticias) => noticias.map(noticia => ({
        id: noticia.id,
        titulo: noticia.titulo,
        fonte: noticia.fonte,
        data: noticia.data_publicacao,
        tags: noticia.tags || [],
        url: noticia.url
      }));
      
      res.json({
        success: true,
        data: {
          ia: formatarNoticias(ia),
          dados: formatarNoticias(dados)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar notícias por categoria:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }

  static async atualizarFeeds(req, res) {
    try {
      const resultados = await rssService.atualizarTodosFeeds();
      res.json({ 
        sucesso: true, 
        mensagem: 'Feeds atualizados com sucesso',
        resultados 
      });
    } catch (error) {
      console.error('Erro ao atualizar feeds:', error);
      res.status(500).json({ error: 'Erro ao atualizar feeds' });
    }
  }

  static async estatisticas(req, res) {
    try {
      const stats = await NoticiaModel.buscarNoticiasPorCategoria();
      res.json(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = NoticiaController;