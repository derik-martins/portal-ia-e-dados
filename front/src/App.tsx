import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('inicio');

  const handleNavigation = (view: string) => {
    setCurrentView(view);
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => {}} />;
  }

  return (
    <Dashboard 
      currentView={currentView}
      onNavigate={handleNavigation}
      onLogout={() => {}}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;