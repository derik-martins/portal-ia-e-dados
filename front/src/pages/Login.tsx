import React from 'react';
import { motion } from 'framer-motion';
import FormularioLogin from '../components/features/autenticacao/FormularioLogin';
import logoGC from '../img/logo-gc.png';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <motion.div 
      className="min-h-screen flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Coluna Esquerda - Branding */}
      <motion.div 
        className="w-1/2 bg-black flex flex-col items-center justify-center text-white p-16"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="text-center">
          <motion.img 
            src={logoGC} 
            alt="Logo GC" 
            className="w-48 h-48 mb-6 mx-auto object-contain"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              duration: 1, 
              delay: 0.5,
              type: "spring",
              stiffness: 200,
              damping: 10
            }}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
          />
          <motion.p 
            className="text-xl text-gray-200 font-light"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            O Covil dos Polenteiros - Trilha de IA e Dados
          </motion.p>
        </div>
      </motion.div>
      
      {/* Coluna Direita - Formulário */}
      <motion.div 
        className="w-1/2 bg-white flex items-center justify-center p-16"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <motion.div 
          className="w-full max-w-md"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <FormularioLogin onLogin={onLogin} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;