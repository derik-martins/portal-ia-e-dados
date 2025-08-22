import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ApiService from '../../../services/api';
import Card from '../../ui/Card';
import Botao from '../../ui/Botao';
import Avatar from '../../ui/Avatar';
import InsigniasPerfil from '../insignias/InsigniasPerfil';
import { 
  Camera, 
  Plus, 
  X, 
  Github, 
  Linkedin, 
  Globe,
  MapPin,
  Phone
} from 'lucide-react';

interface PerfilUsuarioProps {
  onClose?: () => void;
}

const PerfilUsuario: React.FC<PerfilUsuarioProps> = ({ onClose }) => {
  const { user, logout, updateUser, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    linkedin_url: '',
    github_url: '',
    website_url: '',
    location: '',
    phone: '',
    interests: [] as string[],
    skills: [] as string[]
  });
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Carregar dados atualizados quando o componente for montado
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          await refreshUserData();
        } catch (error) {
          console.error('Erro ao carregar dados iniciais do perfil:', error);
        }
      }
    };
    
    loadUserData();
  }, []); // Executar apenas uma vez quando o componente for montado

  // Sincronizar formData com dados do usuário quando eles mudarem ou quando entrar em modo de edição
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        linkedin_url: user.linkedin_url || '',
        github_url: user.github_url || '',
        website_url: user.website_url || '',
        location: user.location || '',
        phone: user.phone || '',
        interests: user.interests || [],
        skills: user.skills || []
      });
    }
  }, [user]);

  // Garantir que os dados sejam recarregados quando entrar em modo de edição
  useEffect(() => {
    if (isEditing && user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        linkedin_url: user.linkedin_url || '',
        github_url: user.github_url || '',
        website_url: user.website_url || '',
        location: user.location || '',
        phone: user.phone || '',
        interests: user.interests || [],
        skills: user.skills || []
      });
    }
  }, [isEditing, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await ApiService.updateProfile({
        name: formData.name.trim(),
        bio: formData.bio.trim() || undefined,
        linkedin_url: formData.linkedin_url.trim() || undefined,
        github_url: formData.github_url.trim() || undefined,
        website_url: formData.website_url.trim() || undefined,
        location: formData.location.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        interests: formData.interests,
        skills: formData.skills
      });

      if (response.success) {
        setMessage('Perfil atualizado com sucesso!');
        setIsEditing(false);
        
        if (response.data?.user) {
          updateUser(response.data.user);
        }
      } else {
        setMessage(response.message || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setMessage('Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('A imagem deve ter no máximo 5MB');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await ApiService.updateProfileImage(file);

      if (response.success) {
        setMessage('Foto de perfil atualizada com sucesso!');
        
        if (response.data?.user) {
          updateUser(response.data.user);
        }
      } else {
        setMessage(response.message || 'Erro ao atualizar foto');
      }
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      setMessage('Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('A imagem deve ter no máximo 5MB');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await ApiService.updateBannerImage(file);

      if (response.success) {
        setMessage('Banner atualizado com sucesso!');
        
        if (response.data?.user) {
          updateUser(response.data.user);
        }
      } else {
        setMessage(response.message || 'Erro ao atualizar banner');
      }
    } catch (error) {
      console.error('Erro ao fazer upload do banner:', error);
      setMessage('Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!user?.profile_image || !confirm('Tem certeza que deseja remover sua foto de perfil?')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await ApiService.removeProfileImage();

      if (response.success) {
        setMessage('Foto de perfil removida com sucesso!');
        
        if (response.data?.user) {
          updateUser(response.data.user);
        }
      } else {
        setMessage(response.message || 'Erro ao remover foto');
      }
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      setMessage('Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBanner = async () => {
    if (!user?.banner_image || !confirm('Tem certeza que deseja remover seu banner?')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await ApiService.removeBannerImage();

      if (response.success) {
        setMessage('Banner removido com sucesso!');
        
        if (response.data?.user) {
          updateUser(response.data.user);
        }
      } else {
        setMessage(response.message || 'Erro ao remover banner');
      }
    } catch (error) {
      console.error('Erro ao remover banner:', error);
      setMessage('Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    // Restaurar dados originais do usuário
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        linkedin_url: user.linkedin_url || '',
        github_url: user.github_url || '',
        website_url: user.website_url || '',
        location: user.location || '',
        phone: user.phone || '',
        interests: user.interests || [],
        skills: user.skills || []
      });
    }
    setMessage('');
  };

  const startEditing = async () => {
    setLoading(true);
    
    try {
      // Atualizar dados do usuário antes de entrar no modo de edição
      await refreshUserData();
      
      // Garantir que os dados estão atualizados antes de entrar no modo de edição
      if (user) {
        setFormData({
          name: user.name || '',
          bio: user.bio || '',
          linkedin_url: user.linkedin_url || '',
          github_url: user.github_url || '',
          website_url: user.website_url || '',
          location: user.location || '',
          phone: user.phone || '',
          interests: user.interests || [],
          skills: user.skills || []
        });
      }
      
      setIsEditing(true);
      setMessage('');
    } catch (error) {
      console.error('Erro ao carregar dados do perfil:', error);
      setMessage('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Meu Perfil</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Banner */}
          <div className="relative mb-8 -mx-6 lg:-mx-8">
            <div 
              className="h-48 lg:h-56 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-none lg:rounded-lg relative overflow-hidden"
              style={{
                backgroundImage: user.banner_image 
                  ? `url(${import.meta.env.DEV ? 'http://localhost:3001' : ''}${user.banner_image})` 
                  : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={loading}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
                >
                  <Camera size={20} />
                </button>
                {user.banner_image && (
                  <button
                    onClick={handleRemoveBanner}
                    disabled={loading}
                    className="p-2 bg-red-600 bg-opacity-75 text-white rounded-full hover:bg-opacity-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* Avatar posicionado fora do banner para evitar cortes */}
            <div className="absolute -bottom-14 left-6 lg:left-8">
              <div className="relative">
                <Avatar
                  name={user.name}
                  imageUrl={user.profile_image}
                  size="lg"
                  className="border-4 border-white shadow-lg w-24 h-24 lg:w-28 lg:h-28 bg-white"
                />
                <div className="absolute bottom-0 right-0 flex gap-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="p-1.5 lg:p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg z-10"
                    title="Alterar foto de perfil"
                  >
                    <Camera size={16} className="lg:w-4 lg:h-4" />
                  </button>
                  {user.profile_image && (
                    <button
                      onClick={handleRemoveImage}
                      disabled={loading}
                      className="p-1.5 lg:p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg z-10"
                      title="Remover foto de perfil"
                    >
                      <X size={16} className="lg:w-4 lg:h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="hidden"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Conteúdo principal */}
          <div className="pt-20 space-y-8">
            {/* Informações básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nome *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Seu nome completo"
                  />
                ) : (
                  <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                    {user.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                  {user.email}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <MapPin size={16} className="inline mr-1" />
                  Localização
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Cidade, Estado"
                  />
                ) : (
                  <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                    {user.location || 'Não informado'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Phone size={16} className="inline mr-1" />
                  Telefone
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="(11) 99999-9999"
                  />
                ) : (
                  <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                    {user.phone || 'Não informado'}
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Biografia
              </label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                />
              ) : (
                <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[100px]">
                  {user.bio || (
                    <span className="text-gray-400 italic">
                      Nenhuma biografia cadastrada
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Links sociais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Links Sociais</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Github size={16} className="inline mr-2" />
                    GitHub
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.github_url}
                      onChange={(e) => handleInputChange('github_url', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="https://github.com/seuusername"
                    />
                  ) : (
                    <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                      {user.github_url ? (
                        <a href={user.github_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 break-all">
                          {user.github_url}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">Não informado</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Linkedin size={16} className="inline mr-2" />
                    LinkedIn
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.linkedin_url}
                      onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="https://linkedin.com/in/seuusername"
                    />
                  ) : (
                    <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                      {user.linkedin_url ? (
                        <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 break-all">
                          {user.linkedin_url}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">Não informado</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Globe size={16} className="inline mr-2" />
                    Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => handleInputChange('website_url', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="https://seusite.com"
                    />
                  ) : (
                    <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                      {user.website_url ? (
                        <a href={user.website_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 break-all">
                          {user.website_url}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">Não informado</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Skills ({formData.skills.length})
              </h3>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Digite uma skill e pressione Enter"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      <Plus size={18} />
                      Adicionar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2 hover:bg-blue-200 transition-colors"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 italic py-4">Nenhuma skill cadastrada</span>
                  )}
                </div>
              )}
            </div>

            {/* Interesses */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Interesses ({formData.interests.length})
              </h3>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Digite um interesse e pressione Enter"
                    />
                    <button
                      type="button"
                      onClick={addInterest}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      <Plus size={18} />
                      Adicionar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2 hover:bg-green-200 transition-colors"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-200 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.interests && user.interests.length > 0 ? (
                    user.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 italic py-4">Nenhum interesse cadastrado</span>
                  )}
                </div>
              )}
            </div>

            {/* Insígnias */}
            {!isEditing && (
              <div>
                <InsigniasPerfil userId={user.id} showTitle={true} />
              </div>
            )}

            {/* Mensagens */}
            {message && (
              <div className={`p-4 rounded-lg border ${
                message.includes('sucesso') 
                  ? 'bg-green-50 text-green-800 border-green-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              {isEditing ? (
                <>
                  <Botao
                    onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                    disabled={loading || !formData.name.trim()}
                    className="flex-1 py-3"
                    loading={loading}
                  >
                    Salvar Alterações
                  </Botao>
                  <Botao
                    variant="secondary"
                    onClick={cancelEdit}
                    disabled={loading}
                    className="flex-1 py-3"
                  >
                    Cancelar
                  </Botao>
                </>
              ) : (
                <>
                  <Botao
                    onClick={startEditing}
                    disabled={loading}
                    className="flex-1 py-3"
                  >
                    Editar Perfil
                  </Botao>
                  <Botao
                    variant="outline"
                    onClick={logout}
                    disabled={loading}
                    className="flex-1 py-3"
                  >
                    Sair
                  </Botao>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PerfilUsuario;
