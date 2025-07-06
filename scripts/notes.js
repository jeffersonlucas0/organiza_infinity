class NotesManager {
  constructor() {
    this.notes = JSON.parse(localStorage.getItem("notes")) || []
    this.currentEditingNote = null
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.loadNotes()
  }

  setupEventListeners() {
    const addNoteBtn = document.getElementById("addNoteBtn")
    const noteModal = document.getElementById("noteModal")
    const closeNoteModal = document.getElementById("closeNoteModal")
    const cancelNote = document.getElementById("cancelNote")
    const saveNote = document.getElementById("saveNote")

    const quickNoteBtn = document.getElementById("quickNoteBtn")
    const quickNoteModal = document.getElementById("quickNoteModal")
    const closeQuickNote = document.getElementById("closeQuickNote")
    const cancelQuickNote = document.getElementById("cancelQuickNote")
    const saveQuickNote = document.getElementById("saveQuickNote")

    if (addNoteBtn) {
      addNoteBtn.addEventListener("click", () => this.openNoteModal())
    }

    if (quickNoteBtn) {
      quickNoteBtn.addEventListener("click", () => this.openQuickNoteModal())
    }

    if (closeNoteModal) {
      closeNoteModal.addEventListener("click", () => this.closeNoteModal())
    }

    if (cancelNote) {
      cancelNote.addEventListener("click", () => this.closeNoteModal())
    }

    if (saveNote) {
      saveNote.addEventListener("click", () => this.saveNote())
    }

    if (closeQuickNote) {
      closeQuickNote.addEventListener("click", () => this.closeQuickNoteModal())
    }

    if (cancelQuickNote) {
      cancelQuickNote.addEventListener("click", () => this.closeQuickNoteModal())
    }

    if (saveQuickNote) {
      saveQuickNote.addEventListener("click", () => this.saveQuickNote())
    }

    if (noteModal) {
      noteModal.addEventListener("click", (e) => {
        if (e.target === noteModal) {
          this.closeNoteModal()
        }
      })
    }

    if (quickNoteModal) {
      quickNoteModal.addEventListener("click", (e) => {
        if (e.target === quickNoteModal) {
          this.closeQuickNoteModal()
        }
      })
    }
  }

  openNoteModal(note = null) {
    const modal = document.getElementById("noteModal")
    const titleInput = document.getElementById("noteTitle")
    const contentInput = document.getElementById("noteContent")
    const colorSelect = document.getElementById("noteColor")

    if (note) {
      this.currentEditingNote = note
      titleInput.value = note.title || ""
      contentInput.value = note.content || ""
      colorSelect.value = note.color || "yellow"
    } else {
      this.currentEditingNote = null
      titleInput.value = ""
      contentInput.value = ""
      colorSelect.value = "yellow"
    }

    modal.classList.add("show")
    titleInput.focus()
  }

  closeNoteModal() {
    const modal = document.getElementById("noteModal")
    modal.classList.remove("show")
    this.currentEditingNote = null
  }

  openQuickNoteModal() {
    const modal = document.getElementById("quickNoteModal")
    const textarea = document.getElementById("quickNoteText")

    textarea.value = ""
    modal.classList.add("show")
    textarea.focus()
  }

  closeQuickNoteModal() {
    const modal = document.getElementById("quickNoteModal")
    modal.classList.remove("show")
  }

  saveNote() {
    const title = document.getElementById("noteTitle").value.trim()
    const content = document.getElementById("noteContent").value.trim()
    const color = document.getElementById("noteColor").value

    if (!content) {
      alert("Por favor, adicione algum conteúdo à anotação.")
      return
    }

    const noteData = {
      id: this.currentEditingNote ? this.currentEditingNote.id : Date.now(),
      title: title || "Sem título",
      content: content,
      color: color,
      createdAt: this.currentEditingNote ? this.currentEditingNote.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (this.currentEditingNote) {
      // Editar nota existente
      const index = this.notes.findIndex((n) => n.id === this.currentEditingNote.id)
      if (index !== -1) {
        this.notes[index] = noteData
      }
    } else {
      // Criar nova nota
      this.notes.unshift(noteData)
    }

    this.saveToStorage()
    this.loadNotes()
    this.closeNoteModal()
    this.showNotification("Anotação salva com sucesso!", "success")
  }

  saveQuickNote() {
    const content = document.getElementById("quickNoteText").value.trim()

    if (!content) {
      alert("Por favor, adicione algum conteúdo à anotação.")
      return
    }

    const noteData = {
      id: Date.now(),
      title: "Anotação Rápida",
      content: content,
      color: "yellow",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.notes.unshift(noteData)
    this.saveToStorage()
    this.loadNotes()
    this.closeQuickNoteModal()
    this.showNotification("Anotação rápida salva!", "success")
  }

  deleteNote(noteId) {
    if (confirm("Tem certeza que deseja excluir esta anotação?")) {
      this.notes = this.notes.filter((note) => note.id !== noteId)
      this.saveToStorage()
      this.loadNotes()
      this.showNotification("Anotação excluída!", "success")
    }
  }

  editNote(noteId) {
    const note = this.notes.find((n) => n.id === noteId)
    if (note) {
      this.openNoteModal(note)
    }
  }

  loadNotes() {
    const containers = [document.getElementById("notesContainer"), document.getElementById("recentNotes")]

    containers.forEach((container) => {
      if (container) {
        this.renderNotes(container)
      }
    })

    // Update stats if dashboard manager exists
    if (window.dashboardManager) {
      window.dashboardManager.updateStats()
    }
  }

  renderNotes(container, limit = null) {
    const notesToShow = limit ? this.notes.slice(0, limit) : this.notes

    if (notesToShow.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-sticky-note"></i>
          <h3>Nenhuma anotação ainda</h3>
          <p>Suas anotações aparecerão aqui</p>
        </div>
      `
      return
    }

    container.innerHTML = notesToShow
      .map(
        (note) => `
      <div class="note-item ${note.color}" data-note-id="${note.id}">
        <div class="note-header">
          <h4 class="note-title">${note.title}</h4>
          <div class="note-actions">
            <button class="note-action-btn" onclick="notesManager.editNote(${note.id})" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="note-action-btn" onclick="notesManager.deleteNote(${note.id})" title="Excluir">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="note-content">
          ${note.content.length > 150 ? note.content.substring(0, 150) + "..." : note.content}
        </div>
        <div class="note-footer">
          <small class="note-date">
            ${new Date(note.updatedAt).toLocaleDateString("pt-BR")}
          </small>
        </div>
      </div>
    `,
      )
      .join("")
  }

  saveToStorage() {
    localStorage.setItem("notes", JSON.stringify(this.notes))
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.innerHTML = `
      <i class="fas fa-${type === "success" ? "check-circle" : "info-circle"}"></i>
      <span>${message}</span>
    `

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--${type === "success" ? "success" : "info"});
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

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-out"
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  // Public methods for external use
  getNotes() {
    return this.notes
  }

  getNotesCount() {
    return this.notes.length
  }

  searchNotes(query) {
    const searchTerm = query.toLowerCase()
    return this.notes.filter(
      (note) => note.title.toLowerCase().includes(searchTerm) || note.content.toLowerCase().includes(searchTerm),
    )
  }
}

// Initialize notes manager
document.addEventListener("DOMContentLoaded", () => {
  window.notesManager = new NotesManager()
})

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = NotesManager
}
