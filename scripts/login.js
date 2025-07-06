class LoginManager {
  constructor() {
    this.isLoading = false
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.setupAnimations()
  }

  setupEventListeners() {
    // Toggle password visibility
    const togglePassword = document.getElementById("togglePassword")
    const passwordInput = document.getElementById("password")

    if (togglePassword && passwordInput) {
      togglePassword.addEventListener("click", () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
        passwordInput.setAttribute("type", type)

        const icon = togglePassword.querySelector("i")
        icon.classList.toggle("fa-eye")
        icon.classList.toggle("fa-eye-slash")
      })
    }

    // Form submission with loading
    const loginForm = document.getElementById("loginForm")
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleFormSubmit(e))
    }

    // Input animations
    const inputs = document.querySelectorAll(".form-group input")
    inputs.forEach((input) => {
      input.addEventListener("focus", (e) => this.handleInputFocus(e))
      input.addEventListener("blur", (e) => this.handleInputBlur(e))
      input.addEventListener("input", (e) => this.handleInputChange(e))
    })

    // Forgot password
    const forgotPassword = document.querySelector(".forgot-password")
    if (forgotPassword) {
      forgotPassword.addEventListener("click", (e) => this.handleForgotPassword(e))
    }

    // Demo credentials click
    const demoCredentials = document.querySelector(".demo-credentials")
    if (demoCredentials) {
      demoCredentials.addEventListener("click", () => this.fillDemoCredentials())
      demoCredentials.style.cursor = "pointer"
      demoCredentials.title = "Clique para preencher automaticamente"
    }
  }

  setupAnimations() {
    // Animate logo on load
    const logo = document.querySelector(".infinity-logo")
    if (logo) {
      setTimeout(() => {
        logo.style.animation = "pulse 2s ease-in-out infinite"
      }, 1000)
    }

    // Add floating animation to background elements
    this.createFloatingElements()
  }

  createFloatingElements() {
    const wrapper = document.querySelector(".login-wrapper")

    for (let i = 0; i < 5; i++) {
      const element = document.createElement("div")
      element.className = "floating-element"
      element.style.cssText = `
        position: absolute;
        width: ${Math.random() * 20 + 10}px;
        height: ${Math.random() * 20 + 10}px;
        background: rgba(220, 38, 38, ${Math.random() * 0.3 + 0.1});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float ${Math.random() * 10 + 10}s ease-in-out infinite;
        animation-delay: ${Math.random() * 5}s;
        pointer-events: none;
        z-index: 1;
      `
      wrapper.appendChild(element)
    }

    // Add CSS for floating animation
    if (!document.getElementById("floating-animations")) {
      const style = document.createElement("style")
      style.id = "floating-animations"
      style.textContent = `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          25% { transform: translateY(-20px) rotate(90deg); opacity: 0.6; }
          50% { transform: translateY(-40px) rotate(180deg); opacity: 0.3; }
          75% { transform: translateY(-20px) rotate(270deg); opacity: 0.6; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `
      document.head.appendChild(style)
    }
  }

  handleFormSubmit(e) {
    e.preventDefault()

    if (this.isLoading) return

    const email = document.getElementById("email").value.trim()
    const password = document.getElementById("password").value.trim()
    const rememberMe = document.getElementById("rememberMe").checked

    // Validation
    if (!this.validateForm(email, password)) {
      return
    }

    this.showLoading()

    // Simulate API call delay
    setTimeout(() => {
      this.performLogin(email, password, rememberMe)
    }, 2000)
  }

  validateForm(email, password) {
    let isValid = true

    // Email validation
    if (!email) {
      this.showFieldError("email", "E-mail é obrigatório")
      isValid = false
    } else if (!this.isValidEmail(email)) {
      this.showFieldError("email", "E-mail inválido")
      isValid = false
    } else {
      this.clearFieldError("email")
    }

    // Password validation
    if (!password) {
      this.showFieldError("password", "Senha é obrigatória")
      isValid = false
    } else if (password.length < 3) {
      this.showFieldError("password", "Senha deve ter pelo menos 3 caracteres")
      isValid = false
    } else {
      this.clearFieldError("password")
    }

    return isValid
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId)
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

    // Shake animation
    field.style.animation = "shake 0.5s ease-in-out"
    setTimeout(() => {
      field.style.animation = ""
    }, 500)
  }

  clearFieldError(fieldId) {
    const field = document.getElementById(fieldId)
    const formGroup = field.closest(".form-group")
    const existingError = formGroup.querySelector(".field-error")

    if (existingError) {
      existingError.remove()
    }

    field.style.borderColor = ""
    field.style.boxShadow = ""
  }

  performLogin(email, password, rememberMe) {
    // Use the existing auth manager
    if (window.authManager) {
      // Create a fake event object
      const fakeEvent = {
        preventDefault: () => {},
        target: {
          email: { value: email },
          password: { value: password },
        },
      }

      // Set the form values
      document.getElementById("email").value = email
      document.getElementById("password").value = password

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true")
        localStorage.setItem("rememberedEmail", email)
      } else {
        localStorage.removeItem("rememberMe")
        localStorage.removeItem("rememberedEmail")
      }

      this.hideLoading()

      // Show success message briefly
      this.showSuccessMessage("Login realizado com sucesso!")

      setTimeout(() => {
        window.authManager.handleLogin(fakeEvent)
      }, 1000)
    }
  }

  showLoading() {
    this.isLoading = true
    const overlay = document.getElementById("loadingOverlay")
    const loginBtn = document.getElementById("loginBtn")

    if (overlay) {
      overlay.classList.add("show")
    }

    if (loginBtn) {
      loginBtn.disabled = true
      loginBtn.style.opacity = "0.7"
    }
  }

  hideLoading() {
    this.isLoading = false
    const overlay = document.getElementById("loadingOverlay")
    const loginBtn = document.getElementById("loginBtn")

    if (overlay) {
      overlay.classList.remove("show")
    }

    if (loginBtn) {
      loginBtn.disabled = false
      loginBtn.style.opacity = "1"
    }
  }

  showSuccessMessage(message) {
    const successDiv = document.createElement("div")
    successDiv.style.cssText = `
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
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
    `
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`

    document.body.appendChild(successDiv)

    setTimeout(() => {
      successDiv.style.animation = "slideOutRight 0.3s ease-out"
      setTimeout(() => {
        document.body.removeChild(successDiv)
      }, 300)
    }, 2000)
  }

  handleInputFocus(e) {
    const formGroup = e.target.closest(".form-group")
    if (formGroup) {
      formGroup.style.transform = "translateY(-2px)"
      formGroup.style.transition = "transform 0.2s ease"
    }
  }

  handleInputBlur(e) {
    const formGroup = e.target.closest(".form-group")
    if (formGroup) {
      formGroup.style.transform = "translateY(0)"
    }
  }

  handleInputChange(e) {
    // Clear errors on input change
    if (window.authManager) {
      window.authManager.clearFieldErrors()
    }
  }

  handleForgotPassword(e) {
    e.preventDefault()

    const email = document.getElementById("email").value.trim()

    if (!email) {
      alert("Por favor, digite seu e-mail primeiro.")
      document.getElementById("email").focus()
      return
    }

    if (!this.isValidEmail(email)) {
      alert("Por favor, digite um e-mail válido.")
      document.getElementById("email").focus()
      return
    }

    alert(
      `Um link de recuperação foi enviado para ${email}.\n\nEste é um sistema de demonstração, então nenhum e-mail real foi enviado.`,
    )
  }

  fillDemoCredentials() {
    const emailField = document.getElementById("email")
    const passwordField = document.getElementById("password")

    if (emailField && passwordField) {
      emailField.value = "admin@infinityschool.com"
      passwordField.value = "123456"

      // Add animation
      const inputs = [emailField, passwordField]
      inputs.forEach((input, index) => {
        setTimeout(() => {
          input.style.animation = "pulse 0.5s ease-in-out"
          setTimeout(() => {
            input.style.animation = ""
          }, 500)
        }, index * 200)
      })
    }
  }
}

// Add shake animation CSS
const shakeStyle = document.createElement("style")
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`
document.head.appendChild(shakeStyle)

// Initialize login manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new LoginManager()
})
