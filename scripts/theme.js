class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem("theme") || "auto"
    this.init()
  }

  init() {
    this.applyTheme()
    this.setupEventListeners()
  }

  setupEventListeners() {
    const themeToggle = document.getElementById("themeToggle")
    if (themeToggle) {
      themeToggle.addEventListener("click", () => this.toggleTheme())
    }

    // Listen for system theme changes
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (this.currentTheme === "auto") {
        this.applyTheme()
      }
    })
  }

  toggleTheme() {
    const themes = ["light", "dark", "auto"]
    const currentIndex = themes.indexOf(this.currentTheme)
    const nextIndex = (currentIndex + 1) % themes.length

    this.currentTheme = themes[nextIndex]
    this.applyTheme()
    this.saveTheme()
    this.updateToggleIcon()
  }

  applyTheme() {
    const root = document.documentElement

    if (this.currentTheme === "auto") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.setAttribute("data-theme", prefersDark ? "dark" : "light")
    } else {
      root.setAttribute("data-theme", this.currentTheme)
    }

    this.updateToggleIcon()
  }

  updateToggleIcon() {
    const themeToggle = document.getElementById("themeToggle")
    if (!themeToggle) return

    const icon = themeToggle.querySelector("i")
    if (!icon) return

    const currentAppliedTheme = document.documentElement.getAttribute("data-theme")

    icon.className = currentAppliedTheme === "dark" ? "fas fa-sun" : "fas fa-moon"

    // Update tooltip
    themeToggle.title = currentAppliedTheme === "dark" ? "Modo claro" : "Modo escuro"
  }

  saveTheme() {
    localStorage.setItem("theme", this.currentTheme)
  }

  getTheme() {
    return this.currentTheme
  }

  setTheme(theme) {
    if (["light", "dark", "auto"].includes(theme)) {
      this.currentTheme = theme
      this.applyTheme()
      this.saveTheme()
    }
  }
}

// Initialize theme manager
document.addEventListener("DOMContentLoaded", () => {
  window.themeManager = new ThemeManager()
})

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = ThemeManager
}
