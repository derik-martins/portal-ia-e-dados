import React, { useState, useEffect } from 'react';
import SidebarConversas from './SidebarConversas';
import AreaChat from './AreaChat';
import ApiService, { Conversa, Mensagem } from '../../../services/api';

const ChatIA: React.FC = () => {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaAtiva, setConversaAtiva] = useState<number | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [carregandoConversas, setCarregandoConversas] = useState(true);

  // Carregar conversas do usuário
  useEffect(() => {
    carregarConversas();
  }, []);

  // Carregar conversa ativa do localStorage quando o componente inicializar
  useEffect(() => {
    const conversaIdSalva = localStorage.getItem('conversaAtiva');
    if (conversaIdSalva && !isNaN(Number(conversaIdSalva))) {
      const id = Number(conversaIdSalva);
      // Aguardar as conversas carregarem antes de tentar selecionar uma
      if (conversas.length > 0) {
        const conversaExiste = conversas.find(c => c.id === id);
        if (conversaExiste) {
          selecionarConversa(id);
        } else {
          localStorage.removeItem('conversaAtiva');
        }
      }
    }
  }, [conversas]);

  const carregarConversas = async () => {
    try {
      setCarregandoConversas(true);
      const response = await ApiService.listarConversas();
      console.log('📋 Conversas carregadas:', response);
      if (response.success && response.data) {
        setConversas(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setCarregandoConversas(false);
    }
  };

  const selecionarConversa = async (conversaId: number) => {
    if (conversaId === conversaAtiva) return;

    try {
      setCarregando(true);
      setConversaAtiva(conversaId);
      
      // Salvar conversa ativa no localStorage
      localStorage.setItem('conversaAtiva', conversaId.toString());
      
      const response = await ApiService.buscarConversa(conversaId);
      console.log('🔍 Conversa carregada:', response);
      if (response.success && response.data) {
        setMensagens(response.data.mensagens);
      }
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
      // Se der erro, remover do localStorage
      localStorage.removeItem('conversaAtiva');
    } finally {
      setCarregando(false);
    }
  };

  const criarNovaConversa = async (primeiraMensagem: string) => {
    try {
      setCarregando(true);
      
      // Adicionar mensagem do usuário imediatamente na tela (para nova conversa)
      const novaMensagemUsuario: Mensagem = {
        id: Date.now(), // ID temporário
        conversa_id: 0, // Temporário
        role: 'user',
        content: primeiraMensagem,
        created_at: new Date().toISOString()
      };
      
      setMensagens([novaMensagemUsuario]);
      
      const response = await ApiService.criarConversa(primeiraMensagem);
      console.log('🔍 Resposta do backend:', response);
      
      if (response.success && response.data) {
        const { conversa, mensagens: novasMensagens } = response.data;
        
        // Adicionar nova conversa à lista
        setConversas(prev => [conversa, ...prev]);
        
        // Selecionar a nova conversa
        setConversaAtiva(conversa.id);
        setMensagens(novasMensagens);
        
        // Salvar no localStorage
        localStorage.setItem('conversaAtiva', conversa.id.toString());
      }
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      // Em caso de erro, limpar mensagens temporárias
      setMensagens([]);
    } finally {
      setCarregando(false);
    }
  };

  const enviarMensagem = async (mensagem: string) => {
    if (!conversaAtiva) {
      // Se não há conversa ativa, criar uma nova
      await criarNovaConversa(mensagem);
      return;
    }

    const idTemporario = Date.now();
    
    try {
      setCarregando(true);
      
      // Adicionar mensagem do usuário imediatamente na tela
      const novaMensagemUsuario: Mensagem = {
        id: idTemporario, // ID temporário
        conversa_id: conversaAtiva,
        role: 'user',
        content: mensagem,
        created_at: new Date().toISOString()
      };
      
      setMensagens(prev => [...prev, novaMensagemUsuario]);
      
      const response = await ApiService.enviarMensagem(conversaAtiva, mensagem);
      console.log('🔍 Resposta do envio:', response);
      
      if (response.success && response.data) {
        // Substituir todas as mensagens com a resposta atualizada do servidor
        setMensagens(response.data.mensagens);
        
        // Atualizar a conversa na lista (última mensagem)
        setConversas(prev => prev.map(conv => 
          conv.id === conversaAtiva 
            ? { 
                ...conv, 
                updated_at: new Date().toISOString(),
                ultima_mensagem: mensagem 
              }
            : conv
        ));
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Em caso de erro, remover a mensagem temporária
      setMensagens(prev => prev.filter(msg => msg.id !== idTemporario));
    } finally {
      setCarregando(false);
    }
  };

  const excluirConversa = async (conversaId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta conversa?')) return;

    try {
      const response = await ApiService.deletarConversa(conversaId);
      if (response.success) {
        // Remover conversa da lista
        setConversas(prev => prev.filter(conv => conv.id !== conversaId));
        
        // Se era a conversa ativa, limpar seleção
        if (conversaId === conversaAtiva) {
          setConversaAtiva(null);
          setMensagens([]);
          localStorage.removeItem('conversaAtiva');
        }
      }
    } catch (error) {
      console.error('Erro ao excluir conversa:', error);
    }
  };

  const atualizarTitulo = async (conversaId: number, novoTitulo: string) => {
    try {
      const response = await ApiService.atualizarTituloConversa(conversaId, novoTitulo);
      if (response.success && response.data) {
        // Atualizar título na lista
        setConversas(prev => prev.map(conv => 
          conv.id === conversaId 
            ? { ...conv, titulo: response.data!.titulo }
            : conv
        ));
      }
    } catch (error) {
      console.error('Erro ao atualizar título:', error);
    }
  };

  const iniciarNovaConversa = () => {
    setConversaAtiva(null);
    setMensagens([]);
    // Remover conversa ativa do localStorage
    localStorage.removeItem('conversaAtiva');
  };

  if (carregandoConversas) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39FF14] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white overflow-hidden">
      <SidebarConversas
        conversas={conversas}
        conversaAtiva={conversaAtiva}
        onSelecionarConversa={selecionarConversa}
        onNovaConversa={iniciarNovaConversa}
        onExcluirConversa={excluirConversa}
        onAtualizarTitulo={atualizarTitulo}
      />
      <AreaChat
        mensagens={mensagens}
        onEnviarMensagem={enviarMensagem}
        carregando={carregando}
        conversaId={conversaAtiva}
      />
    </div>
  );
};

export default ChatIA;
