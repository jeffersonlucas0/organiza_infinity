class AuthManager {
  constructor() {
    this.currentUser = null
    this.isAuthenticated = false
    this.init()
  }

  init() {
    this.loadUserFromStorage()
    this.setupEventListeners()
  }

  setupEventListeners() {
    // Check if we're on login page
    const loginForm = document.getElementById("loginForm")
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e))
    }

    // Check authentication on page load
    this.checkAuthenticationStatus()
  }

  loadUserFromStorage() {
    try {
      const userData = localStorage.getItem("user")
      const authStatus = localStorage.getItem("isAuthenticated")

      if (userData && authStatus === "true") {
        this.currentUser = JSON.parse(userData)
        this.isAuthenticated = true
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      this.clearAuthData()
    }
  }

  handleLogin(event) {
    event.preventDefault()

    const formData = new FormData(event.target)
    const email = formData.get("email")?.trim()
    const password = formData.get("password")?.trim()
    const rememberMe = formData.get("rememberMe") === "on"

    if (!this.validateLoginForm(email, password)) {
      return
    }

    this.showLoading(true)

    // Simulate API call
    setTimeout(() => {
      this.performLogin(email, password, rememberMe)
    }, 1500)
  }

  validateLoginForm(email, password) {
    let isValid = true

    // Clear previous errors
    this.clearFieldErrors()

    // Email validation
    if (!email) {
      this.showFieldError("email", "E-mail é obrigatório")
      isValid = false
    } else if (!this.isValidEmail(email)) {
      this.showFieldError("email", "E-mail inválido")
      isValid = false
    }

    // Password validation
    if (!password) {
      this.showFieldError("password", "Senha é obrigatória")
      isValid = false
    } else if (password.length < 3) {
      this.showFieldError("password", "Senha deve ter pelo menos 3 caracteres")
      isValid = false
    }

    return isValid
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  showFieldError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}Error`)
    if (errorElement) {
      errorElement.textContent = message
      errorElement.classList.add("show")
    }

    const field = document.getElementById(fieldId)
    if (field) {
      field.style.borderColor = "var(--error)"
      field.style.boxShadow = "0 0 0 4px rgba(239, 68, 68, 0.1)"
    }
  }

  clearFieldErrors() {
    const errorElements = document.querySelectorAll(".field-error")
    errorElements.forEach((element) => {
      element.textContent = ""
      element.classList.remove("show")
    })

    const fields = document.querySelectorAll("#email, #password")
    fields.forEach((field) => {
      field.style.borderColor = ""
      field.style.boxShadow = ""
    })
  }

  performLogin(email, password, rememberMe) {
    // Create user object
    const user = {
      id: Date.now(),
      name: email
        .split("@")[0]
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      email: email,
      role: "professor",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }

    // Save user data
    this.currentUser = user
    this.isAuthenticated = true

    localStorage.setItem("user", JSON.stringify(user))
    localStorage.setItem("isAuthenticated", "true")

    if (rememberMe) {
      localStorage.setItem("rememberMe", "true")
      localStorage.setItem("rememberedEmail", email)
    }

    this.showLoading(false)
    this.showSuccessMessage("Login realizado com sucesso!")

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = "dashboard.html"
    }, 1000)
  }

  handleLogout(event) {
    if (event) {
      event.preventDefault()
    }

    if (confirm("Tem certeza que deseja sair do sistema?")) {
      this.clearAuthData()
      window.location.href = "index.html"
    }
  }

  clearAuthData() {
    this.currentUser = null
    this.isAuthenticated = false

    localStorage.removeItem("user")
    localStorage.removeItem("isAuthenticated")
    // Keep rememberMe data if it exists
  }

  checkAuthenticationStatus() {
    const currentPage = window.location.pathname.split("/").pop()

    if (currentPage === "index.html" || currentPage === "") {
      // On login page
      if (this.isAuthenticated) {
        window.location.href = "dashboard.html"
      } else {
        this.loadRememberedCredentials()
      }
    } else {
      // On protected pages
      if (!this.isAuthenticated) {
        window.location.href = "index.html"
      }
    }
  }

  loadRememberedCredentials() {
    const rememberMe = localStorage.getItem("rememberMe")
    const rememberedEmail = localStorage.getItem("rememberedEmail")

    if (rememberMe === "true" && rememberedEmail) {
      const emailField = document.getElementById("email")
      const rememberCheckbox = document.getElementById("rememberMe")

      if (emailField) emailField.value = rememberedEmail
      if (rememberCheckbox) rememberCheckbox.checked = true
    }
  }

  showLoading(show) {
    const overlay = document.getElementById("loadingOverlay")
    const loginBtn = document.getElementById("loginBtn")

    if (overlay) {
      overlay.classList.toggle("show", show)
    }

    if (loginBtn) {
      loginBtn.disabled = show
      loginBtn.style.opacity = show ? "0.7" : "1"
    }
  }

  showSuccessMessage(message) {
    const notification = document.createElement("div")
    notification.className = "success-notification"
    notification.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    `

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
      z-index: 10001;
      animation: slideIn 0.3s ease-out;
    `

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-out"
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 300)
    }, 2000)
  }

  getCurrentUser() {
    return this.currentUser
  }

  updateUser(userData) {
    this.currentUser = { ...this.currentUser, ...userData }
    localStorage.setItem("user", JSON.stringify(this.currentUser))
  }
}

// Initialize auth manager
document.addEventListener("DOMContentLoaded", () => {
  window.authManager = new AuthManager()
})

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = AuthManager
}
