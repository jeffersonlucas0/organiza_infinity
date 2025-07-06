class SearchManager {
  constructor() {
    this.searchResults = []
    this.init()
  }

  init() {
    this.setupEventListeners()
  }

  setupEventListeners() {
    const searchInput = document.getElementById("globalSearch")
    const searchResults = document.getElementById("searchResults")

    if (searchInput) {
      let searchTimeout

      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout)
        const query = e.target.value.trim()

        if (query.length < 2) {
          this.hideResults()
          return
        }

        searchTimeout = setTimeout(() => {
          this.performSearch(query)
        }, 300)
      })

      searchInput.addEventListener("focus", () => {
        if (searchInput.value.trim().length >= 2) {
          this.showResults()
        }
      })

      // Hide results when clicking outside
      document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !searchResults?.contains(e.target)) {
          this.hideResults()
        }
      })
    }
  }

  performSearch(query) {
    this.searchResults = []
    const searchTerm = query.toLowerCase()

    // Search in notes
    if (window.notesManager) {
      const notes = window.notesManager.searchNotes(query)
      notes.forEach((note) => {
        this.searchResults.push({
          type: "note",
          title: note.title,
          content: note.content.substring(0, 100) + "...",
          date: new Date(note.updatedAt).toLocaleDateString("pt-BR"),
          action: () => window.notesManager.editNote(note.id),
        })
      })
    }

    // Search in activities/events
    const events = JSON.parse(localStorage.getItem("events")) || []
    const matchingEvents = events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTerm) ||
        (event.description && event.description.toLowerCase().includes(searchTerm)),
    )

    matchingEvents.forEach((event) => {
      this.searchResults.push({
        type: "event",
        title: event.title,
        content: event.description || "Sem descrição",
        date: new Date(event.date).toLocaleDateString("pt-BR"),
        action: () => (window.location.href = "calendar.html"),
      })
    })

    // Search in habits
    if (window.habitsManager) {
      const habits = window.habitsManager.getHabits()
      const matchingHabits = habits.filter((habit) => habit.name.toLowerCase().includes(searchTerm))

      matchingHabits.forEach((habit) => {
        this.searchResults.push({
          type: "habit",
          title: habit.name,
          content: `Sequência atual: ${habit.streak} dias`,
          date: habit.lastCompleted ? new Date(habit.lastCompleted).toLocaleDateString("pt-BR") : "Nunca",
          action: () => {
            document.getElementById("habitsModal").classList.add("show")
          },
        })
      })
    }

    this.displayResults()
  }

  displayResults() {
    const resultsContainer = document.getElementById("searchResults")
    if (!resultsContainer) return

    if (this.searchResults.length === 0) {
      resultsContainer.innerHTML = `
                <div class="search-result-item no-results">
                    <i class="fas fa-search"></i>
                    <span>Nenhum resultado encontrado</span>
                </div>
            `
    } else {
      resultsContainer.innerHTML = this.searchResults
        .map(
          (result) => `
                <div class="search-result-item" onclick="searchManager.selectResult('${result.type}', ${this.searchResults.indexOf(result)})">
                    <div class="result-icon">
                        <i class="fas fa-${this.getResultIcon(result.type)}"></i>
                    </div>
                    <div class="result-content">
                        <div class="result-title">${result.title}</div>
                        <div class="result-description">${result.content}</div>
                        <div class="result-meta">
                            <span class="result-type">${this.getResultTypeName(result.type)}</span>
                            <span class="result-date">${result.date}</span>
                        </div>
                    </div>
                </div>
            `,
        )
        .join("")
    }

    this.showResults()
  }

  selectResult(type, index) {
    const result = this.searchResults[index]
    if (result && result.action) {
      result.action()
      this.hideResults()
      document.getElementById("globalSearch").value = ""
    }
  }

  getResultIcon(type) {
    const icons = {
      note: "sticky-note",
      event: "calendar",
      habit: "chart-line",
    }
    return icons[type] || "file"
  }

  getResultTypeName(type) {
    const names = {
      note: "Anotação",
      event: "Evento",
      habit: "Hábito",
    }
    return names[type] || "Item"
  }

  showResults() {
    const resultsContainer = document.getElementById("searchResults")
    if (resultsContainer) {
      resultsContainer.style.display = "block"
    }
  }

  hideResults() {
    const resultsContainer = document.getElementById("searchResults")
    if (resultsContainer) {
      resultsContainer.style.display = "none"
    }
  }

  clearSearch() {
    const searchInput = document.getElementById("globalSearch")
    if (searchInput) {
      searchInput.value = ""
    }
    this.hideResults()
  }
}

// Initialize search manager
document.addEventListener("DOMContentLoaded", () => {
  window.searchManager = new SearchManager()
})

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = SearchManager
}
