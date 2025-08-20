import React, { useState } from 'react';
import Input from '../../ui/Input';
import Botao from '../../ui/Botao';
import { useAuth } from '../../../contexts/AuthContext';

interface FormularioLoginProps {
  onLogin: () => void;
}

const FormularioLogin: React.FC<FormularioLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !senha) {
      setError('Por favor, preencha todos os campos');
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(email, senha);
      
      if (result.success) {
        onLogin();
      } else {
        setError(result.message || 'Erro no login');
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
      console.error('Erro no login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-black mb-2">Bem-vindo(a) de volta!</h1>
      <p className="text-gray-600 mb-8">Faça login para acessar o portal.</p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="seu.email@exemplo.com"
          disabled={isLoading}
        />
        
        <Input
          label="Senha"
          type="password"
          value={senha}
          onChange={setSenha}
          placeholder="Digite sua senha"
          disabled={isLoading}
        />
        
        <Botao type="submit" fullWidth disabled={isLoading}>
          {isLoading ? 'ENTRANDO...' : 'ENTRAR'}
        </Botao>
        
        <div className="text-center mt-6">
          <a href="#" className="text-sm text-gray-600 hover:text-[#39FF14] transition-colors">
            Esqueceu sua senha?
          </a>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          <strong>Credenciais de teste:</strong><br />
          Email: admin@geracao-caldeira.com<br />
          Senha: 123456
        </div>
      </form>
    </div>
  );
};

export default FormularioLogin;