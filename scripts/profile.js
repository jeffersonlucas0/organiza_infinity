// Import or declare authManager before using it
const authManager = {
  getCurrentUser: () => {
    // Simulated user data
    return JSON.parse(localStorage.getItem("user")) || null
  },
  updateUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user))
  },
}

class ProfileManager {
  constructor() {
    this.user = authManager.getCurrentUser()
    this.init()
  }

  init() {
    this.loadUserData()
    this.setupEventListeners()
  }

  loadUserData() {
    if (!this.user) {
      // Se não há usuário, criar um usuário padrão
      this.user = {
        id: Date.now(),
        name: "Usuário Demo",
        email: "usuario@infinityschool.com",
        role: "professor",
        bio: "",
        phone: "",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      authManager.updateUser(this.user)
    }

    // Atualizar elementos do perfil
    const profileName = document.getElementById("profileName")
    const profileRole = document.getElementById("profileRole")
    const profileEmail = document.getElementById("profileEmail")
    const profileAvatar = document.getElementById("profileAvatar")

    if (profileName) profileName.textContent = this.user.name || "Nome do Usuário"
    if (profileRole) profileRole.textContent = this.user.role || "Função"
    if (profileEmail) profileEmail.textContent = this.user.email || "email@infinity.com"
    if (profileAvatar) profileAvatar.src = this.user.avatar || "https://via.placeholder.com/120"

    // Preencher formulário
    const userName = document.getElementById("userName")
    const userEmail = document.getElementById("userEmail")
    const userRole = document.getElementById("userRole")
    const userBio = document.getElementById("userBio")
    const userPhone = document.getElementById("userPhone")

    if (userName) userName.value = this.user.name || ""
    if (userEmail) userEmail.value = this.user.email || ""
    if (userRole) userRole.value = this.user.role || "professor"
    if (userBio) userBio.value = this.user.bio || ""
    if (userPhone) userPhone.value = this.user.phone || ""
  }

  setupEventListeners() {
    const saveProfileBtn = document.getElementById("saveProfileBtn")
    const changeAvatarBtn = document.getElementById("changeAvatarBtn")
    const avatarUpload = document.getElementById("avatarUpload")
    const resetProfileBtn = document.getElementById("resetProfileBtn")

    if (saveProfileBtn) {
      saveProfileBtn.addEventListener("click", () => this.saveProfile())
    }

    if (changeAvatarBtn) {
      changeAvatarBtn.addEventListener("click", () => this.openAvatarOptions())
    }

    if (avatarUpload) {
      avatarUpload.addEventListener("change", (e) => this.handleAvatarUpload(e))
    }

    if (resetProfileBtn) {
      resetProfileBtn.addEventListener("click", () => this.loadUserData())
    }

    // Validação em tempo real
    const inputs = document.querySelectorAll("#userName, #userEmail, #userPhone")
    inputs.forEach((input) => {
      input.addEventListener("input", () => this.validateForm())
    })
  }

  saveProfile() {
    const name = document.getElementById("userName").value.trim()
    const email = document.getElementById("userEmail").value.trim()
    const role = document.getElementById("userRole").value
    const bio = document.getElementById("userBio").value.trim()
    const phone = document.getElementById("userPhone").value.trim()

    // Validações
    if (!name) {
      this.showFieldError("userName", "Por favor, preencha o nome.")
      return
    }

    if (!email || !this.isValidEmail(email)) {
      this.showFieldError("userEmail", "Por favor, preencha um e-mail válido.")
      return
    }

    if (phone && !this.isValidPhone(phone)) {
      this.showFieldError("userPhone", "Por favor, preencha um telefone válido.")
      return
    }

    // Atualizar dados do usuário
    const updatedUser = {
      ...this.user,
      name,
      email,
      role,
      bio,
      phone,
      updatedAt: new Date().toISOString(),
    }

    // Salvar no localStorage através do authManager
    authManager.updateUser(updatedUser)
    this.user = updatedUser

    // Atualizar interface do perfil
    this.loadUserData()

    // Atualizar nome no header se estiver visível
    const userNameElements = document.querySelectorAll("#userName, .user-info span")
    userNameElements.forEach((element) => {
      if (element.tagName !== "INPUT") {
        element.textContent = name
      }
    })

    this.showSuccessMessage("Perfil atualizado com sucesso!")

    // Limpar erros
    this.clearAllFieldErrors()
  }

  changeAvatar() {
    // Simulação de mudança de avatar
    const avatars = [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=120&h=120&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
    ]

    const currentAvatar = this.user.avatar
    let newAvatar

    do {
      newAvatar = avatars[Math.floor(Math.random() * avatars.length)]
    } while (newAvatar === currentAvatar)

    // Atualizar avatar
    const updatedUser = {
      ...this.user,
      avatar: newAvatar,
      updatedAt: new Date().toISOString(),
    }

    authManager.updateUser(updatedUser)
    this.user = updatedUser

    // Atualizar interface
    document.getElementById("profileAvatar").src = newAvatar

    // Atualizar avatar no header se estiver visível
    const userAvatarElements = document.querySelectorAll(".user-avatar")
    userAvatarElements.forEach((avatar) => {
      avatar.src = newAvatar
    })

    this.showSuccessMessage("Avatar atualizado com sucesso!")
  }

  validateForm() {
    const name = document.getElementById("userName").value.trim()
    const email = document.getElementById("userEmail").value.trim()
    const phone = document.getElementById("userPhone").value.trim()
    const saveBtn = document.getElementById("saveProfileBtn")

    const isValid = name && email && this.isValidEmail(email) && (!phone || this.isValidPhone(phone))

    saveBtn.disabled = !isValid
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  isValidPhone(phone) {
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return phoneRegex.test(phone);
}



  showSuccessMessage(message = "Perfil atualizado com sucesso!") {
    // Criar elemento de notificação
    const notification = document.createElement("div")
    notification.className = "success-notification"
    notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `

    // Adicionar estilos inline
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `

    document.body.appendChild(notification)

    // Remover após 3 segundos
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-out"
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  openAvatarOptions() {
    const modal = document.createElement("div")
    modal.className = "avatar-modal"
    modal.innerHTML = `
    <div class="avatar-modal-content">
      <div class="avatar-modal-header">
        <h3>Alterar Foto de Perfil</h3>
        <button class="close-avatar-modal" onclick="this.closest('.avatar-modal').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="avatar-modal-body">
        <div class="avatar-options">
          <button class="avatar-option" onclick="profileManager.uploadCustomAvatar()">
            <i class="fas fa-upload"></i>
            <span>Fazer Upload</span>
          </button>
          <button class="avatar-option" onclick="profileManager.selectRandomAvatar()">
            <i class="fas fa-random"></i>
            <span>Avatar Aleatório</span>
          </button>
        </div>
        <div class="avatar-gallery">
          <h4>Ou escolha um avatar:</h4>
          <div class="avatar-grid">
            ${this.getAvatarOptions()
              .map(
                (avatar) => `
              <img src="${avatar}" class="avatar-choice" onclick="profileManager.selectAvatar('${avatar}')" />
            `,
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `

    // Adicionar estilos
    modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `

    document.body.appendChild(modal)
  }

  getAvatarOptions() {
    return [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=120&h=120&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face",
    ]
  }

  uploadCustomAvatar() {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => this.handleAvatarUpload(e)
    input.click()
  }

  handleAvatarUpload(event) {
    const file = event.target.files[0]
    if (file) {
      // Verificar se é uma imagem válida
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione apenas arquivos de imagem.")
        return
      }

      // Verificar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 5MB.")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target.result
        this.selectAvatar(imageData)
      }
      reader.onerror = () => {
        alert("Erro ao carregar a imagem. Tente novamente.")
      }
      reader.readAsDataURL(file)
    }
  }

  selectAvatar(avatarUrl) {
    // Atualizar avatar do usuário
    const updatedUser = {
      ...this.user,
      avatar: avatarUrl,
      updatedAt: new Date().toISOString(),
    }

    authManager.updateUser(updatedUser)
    this.user = updatedUser

    // Atualizar interface imediatamente
    const profileAvatar = document.getElementById("profileAvatar")
    if (profileAvatar) {
      profileAvatar.src = avatarUrl
      profileAvatar.onload = () => {
        console.log("Avatar carregado com sucesso")
      }
      profileAvatar.onerror = () => {
        console.error("Erro ao carregar avatar")
        // Fallback para avatar padrão
        profileAvatar.src =
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face"
      }
    }

    // Atualizar avatar no header se estiver visível
    const userAvatarElements = document.querySelectorAll(".user-avatar")
    userAvatarElements.forEach((avatar) => {
      avatar.src = avatarUrl
    })

    // Fechar modal
    const modal = document.querySelector(".avatar-modal")
    if (modal) modal.remove()

    this.showSuccessMessage("Avatar atualizado com sucesso!")
  }

  selectRandomAvatar() {
    const avatars = this.getAvatarOptions()
    const currentAvatar = this.user.avatar
    let newAvatar

    do {
      newAvatar = avatars[Math.floor(Math.random() * avatars.length)]
    } while (newAvatar === currentAvatar)

    this.selectAvatar(newAvatar)
  }

  showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId)
    if (!field) return

    const formGroup = field.closest(".form-group")

    // Remove existing error
    this.clearFieldError(fieldId)

    // Add error styling
    field.style.borderColor = "var(--error)"
    field.style.boxShadow = "0 0 0 4px rgba(239, 68, 68, 0.1)"

    // Add error message
    const errorDiv = document.createElement("div")
    errorDiv.className = "field-error"
    errorDiv.style.cssText = `
    color: var(--error);
    font-size: 0.8rem;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  `
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`

    formGroup.appendChild(errorDiv)
  }

  clearFieldError(fieldId) {
    const field = document.getElementById(fieldId)
    if (!field) return

    const formGroup = field.closest(".form-group")
    const existingError = formGroup.querySelector(".field-error")

    if (existingError) {
      existingError.remove()
    }

    field.style.borderColor = ""
    field.style.boxShadow = ""
  }

  clearAllFieldErrors() {
    const errors = document.querySelectorAll(".field-error")
    errors.forEach((error) => error.remove())

    const fields = document.querySelectorAll("#userName, #userEmail, #userPhone")
    fields.forEach((field) => {
      field.style.borderColor = ""
      field.style.boxShadow = ""
    })
  }
}

// Aguardar o DOM carregar antes de inicializar
document.addEventListener("DOMContentLoaded", () => {
  // Máscara para telefone
  const phoneInput = document.getElementById("userPhone")
  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "")

      if (value.length <= 11) {
        if (value.length <= 2) {
          value = value.replace(/(\d{0,2})/, "($1")
        } else if (value.length <= 6) {
          value = value.replace(/(\d{2})(\d{0,4})/, "($1) $2")
        } else if (value.length <= 10) {
          value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
        } else {
          value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
        }
      }

      e.target.value = value
    })
  }

  

  // Inicializar gerenciador de perfil
  window.profileManager = new ProfileManager()
})

document.addEventListener("DOMContentLoaded", () => {
  const removeBtn = document.getElementById("removeAvatarBtn");
  const avatarPreview = document.getElementById("avatarPreview"); // img da foto
  const avatarInput = document.getElementById("avatarInput");     // input de upload

  if (removeBtn && avatarPreview) {
    removeBtn.addEventListener("click", () => {
      // Remove imagem do localStorage
      localStorage.removeItem("userAvatar");

      // Coloca imagem padrão
      avatarPreview.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face";

      // Limpa o input file (opcional)
      if (avatarInput) {
        avatarInput.value = "";
      }

      alert("Foto de perfil removida com sucesso!");
    });
  }
});
