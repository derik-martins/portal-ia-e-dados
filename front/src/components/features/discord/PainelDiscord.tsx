import React, { useState } from 'react';
import TituloSecao from '../../ui/TituloSecao';
import Card from '../../ui/Card';
import Botao from '../../ui/Botao';
import { Hash, Users, Volume2 } from 'lucide-react';

const PainelDiscord: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);

  const canaisImportantes = [
    { nome: "📢│anúncios", tipo: "text", membros: 156 },
    { nome: "💬│chat-geral", tipo: "text", membros: 89 },
    { nome: "🤖│ia-discussoes", tipo: "text", membros: 67 },
    { nome: "📊│dados-analytics", tipo: "text", membros: 45 },
    { nome: "🎤│aula-ao-vivo", tipo: "voice", membros: 23 },
    { nome: "🔧│projetos", tipo: "text", membros: 34 }
  ];

  if (!isConnected) {
    return (
      <div>
        <TituloSecao>Integração com o Discord</TituloSecao>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-12 text-center max-w-md">
            <div className="mb-6">
              <div className="w-16 h-16 bg-[#39FF14] rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={32} className="text-black" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">
                Conecte-se ao Discord
              </h3>
              <p className="text-gray-600">
                Acesse canais exclusivos, participe de discussões e receba notificações importantes diretamente do servidor oficial.
              </p>
            </div>
            
            <Botao onClick={() => setIsConnected(true)} fullWidth>
              Conectar minha conta do Discord
            </Botao>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TituloSecao>Integração com o Discord</TituloSecao>
      
      <div className="mb-6">
        <Card className="p-6 bg-[#F5F5F5]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-black">Conectado como João Silva</h3>
              <p className="text-gray-600">Servidor: Geração Caldeira - IA e Dados</p>
            </div>
            <div className="w-3 h-3 bg-[#39FF14] rounded-full"></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {canaisImportantes.map((canal, index) => (
          <Card key={index} className="p-4 hover:shadow-lg cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {canal.tipo === 'voice' ? (
                  <Volume2 size={16} className="text-gray-600 mr-2" />
                ) : (
                  <Hash size={16} className="text-gray-600 mr-2" />
                )}
                <span className="font-medium text-black text-sm">{canal.nome}</span>
              </div>
            </div>
            
            <div className="flex items-center text-xs text-gray-500">
              <Users size={12} className="mr-1" />
              <span>{canal.membros} membros</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PainelDiscord;