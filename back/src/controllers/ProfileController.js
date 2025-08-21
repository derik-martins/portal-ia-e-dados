const UserModel = require('../models/UserModel');
const fs = require('fs');
const path = require('path');

class ProfileController {
  // Obter perfil do usuário
  static async getProfile(req, res) {
    try {
      const user = await UserModel.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar perfil do usuário (dados completos)
  static async updateProfile(req, res) {
    try {
      const { 
        name, 
        bio, 
        linkedin_url, 
        github_url, 
        website_url, 
        interests, 
        skills, 
        location, 
        phone 
      } = req.body;
      const userId = req.userId;

      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Nome é obrigatório'
        });
      }

      // Validar URLs se fornecidas
      const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      
      if (linkedin_url && !urlRegex.test(linkedin_url)) {
        return res.status(400).json({
          success: false,
          message: 'URL do LinkedIn inválida'
        });
      }

      if (github_url && !urlRegex.test(github_url)) {
        return res.status(400).json({
          success: false,
          message: 'URL do GitHub inválida'
        });
      }

      if (website_url && !urlRegex.test(website_url)) {
        return res.status(400).json({
          success: false,
          message: 'URL do website inválida'
        });
      }

      const updatedUser = await UserModel.atualizarPerfil(userId, {
        name: name.trim(),
        bio: bio ? bio.trim() : null,
        linkedin_url: linkedin_url ? linkedin_url.trim() : null,
        github_url: github_url ? github_url.trim() : null,
        website_url: website_url ? website_url.trim() : null,
        interests: interests || [],
        skills: skills || [],
        location: location ? location.trim() : null,
        phone: phone ? phone.trim() : null
      });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: { user: updatedUser }
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar foto de perfil
  static async updateProfileImage(req, res) {
    try {
      const userId = req.userId;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nenhuma imagem foi enviada'
        });
      }

      // Buscar usuário atual para remover foto anterior
      const currentUser = await UserModel.findById(userId);
      
      if (!currentUser) {
        // Remover o arquivo enviado se usuário não existe
        if (req.file) {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error('Erro ao remover arquivo:', err);
          });
        }
        
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Remover foto anterior se existir
      if (currentUser.profile_image) {
        const oldImagePath = path.join(__dirname, '../../uploads', path.basename(currentUser.profile_image));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Salvar nova imagem no banco
      const imageUrl = `/uploads/${req.file.filename}`;
      const updatedUser = await UserModel.atualizarFotoPerfil(userId, imageUrl);

      res.status(200).json({
        success: true,
        message: 'Foto de perfil atualizada com sucesso',
        data: { 
          user: updatedUser,
          imageUrl: imageUrl
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar foto de perfil:', error);
      
      // Remover arquivo se houve erro
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Erro ao remover arquivo:', err);
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Remover foto de perfil
  static async removeProfileImage(req, res) {
    try {
      const userId = req.userId;

      // Buscar usuário atual
      const currentUser = await UserModel.findById(userId);
      
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Remover foto do sistema de arquivos se existir
      if (currentUser.profile_image) {
        const imagePath = path.join(__dirname, '../../uploads', path.basename(currentUser.profile_image));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Remover referência do banco de dados
      const updatedUser = await UserModel.atualizarFotoPerfil(userId, null);

      res.status(200).json({
        success: true,
        message: 'Foto de perfil removida com sucesso',
        data: { user: updatedUser }
      });
    } catch (error) {
      console.error('Erro ao remover foto de perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar banner de perfil
  static async updateBannerImage(req, res) {
    try {
      const userId = req.userId;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nenhuma imagem foi enviada'
        });
      }

      // Buscar usuário atual para remover banner anterior
      const currentUser = await UserModel.findById(userId);
      
      if (!currentUser) {
        // Remover o arquivo enviado se usuário não existe
        if (req.file) {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error('Erro ao remover arquivo:', err);
          });
        }
        
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Remover banner anterior se existir
      if (currentUser.banner_image) {
        const oldImagePath = path.join(__dirname, '../../uploads', path.basename(currentUser.banner_image));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Salvar novo banner no banco
      const imageUrl = `/uploads/${req.file.filename}`;
      const updatedUser = await UserModel.atualizarBannerPerfil(userId, imageUrl);

      res.status(200).json({
        success: true,
        message: 'Banner de perfil atualizado com sucesso',
        data: { 
          user: updatedUser,
          imageUrl: imageUrl
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar banner de perfil:', error);
      
      // Remover arquivo se houve erro
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Erro ao remover arquivo:', err);
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Remover banner de perfil
  static async removeBannerImage(req, res) {
    try {
      const userId = req.userId;

      // Buscar usuário atual
      const currentUser = await UserModel.findById(userId);
      
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Remover banner do sistema de arquivos se existir
      if (currentUser.banner_image) {
        const imagePath = path.join(__dirname, '../../uploads', path.basename(currentUser.banner_image));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Remover referência do banco de dados
      const updatedUser = await UserModel.atualizarBannerPerfil(userId, null);

      res.status(200).json({
        success: true,
        message: 'Banner de perfil removido com sucesso',
        data: { user: updatedUser }
      });
    } catch (error) {
      console.error('Erro ao remover banner de perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = ProfileController;
