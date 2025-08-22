const ConversaModel = require('../models/ConversaModel');
const AIService = require('../services/aiService');
const { recordChatMessage } = require('../middleware/metricsMiddleware');

class ChatController {
  static async inicializarTabelas(req, res) {
    try {
      await ConversaModel.criarTabela();
      await ConversaModel.criarTabelaMensagens();
      res.json({ success: true, message: 'Tabelas criadas com sucesso' });
    } catch (error) {
      console.error('Erro ao criar tabelas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async listarConversas(req, res) {
    try {
      const userId = req.userId;
      const conversas = await ConversaModel.listarConversas(userId);
      res.json({
        success: true,
        data: conversas
      });
    } catch (error) {
      console.error('Erro ao listar conversas:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro ao buscar conversas' 
      });
    }
  }

  static async criarConversa(req, res) {
    try {
      console.log('🚀 Criando nova conversa...');
      const userId = req.userId;
      const { mensagem } = req.body;

      console.log('👤 UserId:', userId);
      console.log('📝 Mensagem:', mensagem);

      if (!mensagem?.trim()) {
        console.log('❌ Mensagem vazia');
        return res.status(400).json({ error: 'Mensagem é obrigatória' });
      }

      // Criar nova conversa
      console.log('🔄 Gerando título...');
      const titulo = AIService.gerarTituloConversa(mensagem);
      console.log('📑 Título:', titulo);
      
      console.log('💾 Criando conversa no banco...');
      const conversa = await ConversaModel.criarConversa(userId, titulo);
      console.log('✅ Conversa criada:', conversa);

      // Adicionar mensagem do usuário
      console.log('👨 Adicionando mensagem do usuário...');
      await ConversaModel.adicionarMensagem(conversa.id, 'user', mensagem);

      // Gerar resposta da IA
      console.log('🤖 Gerando resposta da IA...');
      const mensagensParaIA = [{ role: 'user', content: mensagem }];
      const respostaIA = await AIService.gerarResposta(mensagensParaIA);
      console.log('💬 Resposta da IA:', respostaIA?.substring(0, 100) + '...');

      // Adicionar resposta da IA
      console.log('💾 Salvando resposta da IA...');
      await ConversaModel.adicionarMensagem(conversa.id, 'assistant', respostaIA);

      // Buscar mensagens completas para retornar
      console.log('📋 Buscando mensagens para retornar...');
      const mensagens = await ConversaModel.buscarMensagens(conversa.id, userId);
      console.log('✅ Mensagens encontradas:', mensagens.length);

      res.json({
        success: true,
        data: {
          conversa,
          mensagens
        }
      });
    } catch (error) {
      console.error('❌ Erro ao criar conversa:', error);
      res.status(500).json({ error: error.message || 'Erro ao criar conversa' });
    }
  }

  static async buscarConversa(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const conversa = await ConversaModel.buscarConversaPorId(id, userId);
      if (!conversa) {
        return res.status(404).json({ 
          success: false,
          error: 'Conversa não encontrada' 
        });
      }

      const mensagens = await ConversaModel.buscarMensagens(id, userId);

      res.json({
        success: true,
        data: {
          conversa,
          mensagens
        }
      });
    } catch (error) {
      console.error('Erro ao buscar conversa:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro ao buscar conversa' 
      });
    }
  }

  static async enviarMensagem(req, res) {
    try {
      console.log('🚀 Enviando mensagem...');
      const userId = req.userId;
      const { id } = req.params;
      const { mensagem } = req.body;

      console.log('👤 UserId:', userId);
      console.log('💬 ConversaId:', id);
      console.log('📝 Mensagem:', mensagem);

      if (!mensagem?.trim()) {
        return res.status(400).json({ 
          success: false,
          error: 'Mensagem é obrigatória' 
        });
      }

      // Verificar se a conversa existe e pertence ao usuário
      const conversa = await ConversaModel.buscarConversaPorId(id, userId);
      if (!conversa) {
        return res.status(404).json({ 
          success: false,
          error: 'Conversa não encontrada' 
        });
      }

      // Adicionar mensagem do usuário
      console.log('👨 Adicionando mensagem do usuário...');
      await ConversaModel.adicionarMensagem(id, 'user', mensagem);
      recordChatMessage('user', 'success');

      // Buscar histórico de mensagens para contexto
      console.log('📋 Buscando histórico...');
      const mensagensHistorico = await ConversaModel.buscarMensagens(id, userId);
      const mensagensParaIA = mensagensHistorico.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Gerar resposta da IA
      console.log('🤖 Gerando resposta da IA...');
      const respostaIA = await AIService.gerarResposta(mensagensParaIA);
      console.log('💭 Resposta da IA:', respostaIA?.substring(0, 100) + '...');

      // Adicionar resposta da IA
      console.log('💾 Salvando resposta da IA...');
      await ConversaModel.adicionarMensagem(id, 'assistant', respostaIA);
      recordChatMessage('assistant', 'success');

      // Buscar mensagens atualizadas
      console.log('📋 Buscando mensagens atualizadas...');
      const mensagensAtualizadas = await ConversaModel.buscarMensagens(id, userId);
      console.log('✅ Total de mensagens:', mensagensAtualizadas.length);

      res.json({
        success: true,
        data: {
          mensagens: mensagensAtualizadas
        }
      });
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      recordChatMessage('system', 'error');
      res.status(500).json({ 
        success: false,
        error: error.message || 'Erro ao enviar mensagem' 
      });
    }
  }

  static async deletarConversa(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const conversa = await ConversaModel.deletarConversa(id, userId);
      if (!conversa) {
        return res.status(404).json({ 
          success: false,
          error: 'Conversa não encontrada' 
        });
      }

      res.json({ 
        success: true,
        message: 'Conversa deletada com sucesso' 
      });
    } catch (error) {
      console.error('Erro ao deletar conversa:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro ao deletar conversa' 
      });
    }
  }

  static async atualizarTitulo(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { titulo } = req.body;

      if (!titulo?.trim()) {
        return res.status(400).json({ 
          success: false,
          error: 'Título é obrigatório' 
        });
      }

      const conversa = await ConversaModel.atualizarTitulo(id, titulo, userId);
      if (!conversa) {
        return res.status(404).json({ 
          success: false,
          error: 'Conversa não encontrada' 
        });
      }

      res.json({
        success: true,
        data: conversa
      });
    } catch (error) {
      console.error('Erro ao atualizar título:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro ao atualizar título' 
      });
    }
  }
}

module.exports = ChatController;
