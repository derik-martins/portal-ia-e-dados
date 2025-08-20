import React from 'react';
import FormularioLogin from '../components/features/autenticacao/FormularioLogin';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex">
      {/* Coluna Esquerda - Branding */}
      <div className="w-1/2 bg-black flex flex-col items-center justify-center text-white p-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-white">GC</span>
            <span className="text-[#39FF14]"> IA e Dados</span>
            <span className="text-white"> 2025</span>
          </h1>
          <p className="text-xl text-gray-200 font-light">
            O seu hub central de aprendizado.
          </p>
        </div>
      </div>
      
      {/* Coluna Direita - Formulário */}
      <div className="w-1/2 bg-white flex items-center justify-center p-16">
        <div className="w-full max-w-md">
          <FormularioLogin onLogin={onLogin} />
        </div>
      </div>
    </div>
  );
};

export default Login;