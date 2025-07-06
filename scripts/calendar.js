class Calendar {
  constructor() {
    this.currentDate = new Date()
    this.selectedDate = null
    this.events = JSON.parse(localStorage.getItem("events")) || []
    this.currentEditingEvent = null
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.renderCalendar()
    this.updateCurrentMonth()
  }

  setupEventListeners() {
    const prevMonth = document.getElementById("prevMonth")
    const nextMonth = document.getElementById("nextMonth")
    const addEventBtn = document.getElementById("addEventBtn")
    const eventModal = document.getElementById("eventModal")
    const closeEventModal = document.getElementById("closeEventModal")
    const cancelEvent = document.getElementById("cancelEvent")
    const saveEvent = document.getElementById("saveEvent")
    const deleteEvent = document.getElementById("deleteEvent")

    if (prevMonth) prevMonth.addEventListener("click", () => this.previousMonth())
    if (nextMonth) nextMonth.addEventListener("click", () => this.nextMonth())
    if (addEventBtn) addEventBtn.addEventListener("click", () => this.openEventModal())
    if (closeEventModal) {
      closeEventModal.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.closeEventModal()
      })
    }
    if (cancelEvent) {
      cancelEvent.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.closeEventModal()
      })
    }
    if (saveEvent) {
      saveEvent.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.saveEvent()
      })
    }
    if (deleteEvent) {
      deleteEvent.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.deleteEvent()
      })
    }
    if (eventModal) {
      eventModal.addEventListener("click", (e) => {
        if (e.target === eventModal) {
          this.closeEventModal()
        }
      })
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && eventModal && eventModal.classList.contains("show")) {
        this.closeEventModal()
      }
    })
  }

  formatDateToLocalString(date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  renderCalendar() {
    const calendarGrid = document.getElementById("calendarGrid")
    if (!calendarGrid) return

    const year = this.currentDate.getFullYear()
    const month = this.currentDate.getMonth()

    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1)
    // Ajustar para o domingo anterior ao primeiro dia do mês
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    let html = `
      <div class="calendar-weekdays">
        <div class="weekday">Dom</div>
        <div class="weekday">Seg</div>
        <div class="weekday">Ter</div>
        <div class="weekday">Qua</div>
        <div class="weekday">Qui</div>
        <div class="weekday">Sex</div>
        <div class="weekday">Sáb</div>
      </div>
      <div class="calendar-days">
    `

    const today = new Date()
    const currentDate = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = currentDate.getMonth() === month
      const isToday = currentDate.toDateString() === today.toDateString()
      const isSelected = this.selectedDate && currentDate.toDateString() === this.selectedDate.toDateString()

      const dayEvents = this.getEventsForDate(currentDate)

      const classes = ["calendar-day"]
      if (!isCurrentMonth) classes.push("other-month")
      if (isToday) classes.push("today")
      if (isSelected) classes.push("selected")

      html += `
        <div class="${classes.join(" ")}" data-date="${this.formatDateToLocalString(currentDate)}" onclick="calendar.selectDate('${this.formatDateToLocalString(currentDate)}')">
          <div class="day-number">${currentDate.getDate()}</div>
          <div class="day-events">
            ${dayEvents
              .map(
                (event) => `
                  <div class="day-event ${event.category}" onclick="event.stopPropagation(); calendar.editEvent(${event.id})">
                    ${event.title}
                  </div>
                `,
              )
              .join("")}
          </div>
        </div>
      `

      currentDate.setDate(currentDate.getDate() + 1)
    }

    html += "</div>"
    calendarGrid.innerHTML = html
  }

  updateCurrentMonth() {
    const currentMonthElement = document.getElementById("currentMonth")
    if (currentMonthElement) {
      const monthNames = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ]
      currentMonthElement.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`
    }
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1)
    this.renderCalendar()
    this.updateCurrentMonth()
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1)
    this.renderCalendar()
    this.updateCurrentMonth()
  }

  selectDate(dateString) {
    // Criar objeto Date local sem considerar horário
    const [year, month, day] = dateString.split("-").map(Number)
    this.selectedDate = new Date(year, month - 1, day)
    this.renderCalendar()
    this.updateSelectedDateInfo()
    this.loadTasksForSelectedDate()

    if (window.innerWidth <= 1024) {
      document.querySelector(".tasks-sidebar").scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  updateSelectedDateInfo() {
    const selectedDateElement = document.getElementById("selectedDate")
    if (selectedDateElement && this.selectedDate) {
      const today = new Date()
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

      let dateText
      if (this.selectedDate.toDateString() === today.toDateString()) {
        dateText = "Hoje"
      } else if (this.selectedDate.toDateString() === tomorrow.toDateString()) {
        dateText = "Amanhã"
      } else {
        const options = {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }
        dateText = this.selectedDate.toLocaleDateString("pt-BR", options)
      }

      selectedDateElement.textContent = dateText
    }
  }

  loadTasksForSelectedDate() {
    const tasksList = document.getElementById("tasksList")
    if (!tasksList || !this.selectedDate) return

    const tasks = this.getEventsForDate(this.selectedDate)

    if (tasks.length === 0) {
      tasksList.innerHTML = `
        <div style="text-align: center; color: var(--text-secondary); padding: 3rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">📅</div>
          <p style="font-weight: 600; margin-bottom: 0.5rem;">Nenhuma atividade para este dia</p>
          <p style="font-size: 0.875rem; opacity: 0.8;">Clique em "Nova Atividade" para adicionar!</p>
        </div>
      `
      return
    }

    const sortedTasks = tasks.sort((a, b) => {
      if (!a.time && !b.time) return 0
      if (!a.time) return 1
      if (!b.time) return -1
      return a.time.localeCompare(b.time)
    })

    tasksList.innerHTML = sortedTasks
      .map(
        (task) => `
        <div class="task-item ${task.priority === "high" ? "priority-high" : ""}" onclick="calendar.editEvent(${task.id})">
          <div class="task-header">
            <div class="task-time">${task.time || "Sem horário"}</div>
            ${task.priority === "high" ? '<i class="fas fa-exclamation-circle priority-icon"></i>' : ""}
          </div>
          <div class="task-title">${task.title}</div>
          <span class="task-category ${task.category}">${this.getCategoryName(task.category)}</span>
          ${task.location ? `<div class="task-location"><i class="fas fa-map-marker-alt"></i> ${task.location}</div>` : ""}
          ${task.description ? `<div class="task-description">${task.description}</div>` : ""}
        </div>
      `,
      )
      .join("")
  }

  getEventsForDate(date) {
    const dateString = this.formatDateToLocalString(date)
    return this.events.filter((event) => event.date === dateString)
  }

  getCategoryName(category) {
    const categories = {
      meeting: "Reunião",
      class: "Aula",
      delivery: "Entrega",
      event: "Evento",
      exam: "Avaliação",
      lecture: "Palestra",
      personal: "Pessoal",
    }
    return categories[category] || category
  }

  openEventModal(event = null) {
    const modal = document.getElementById("eventModal")
    const modalTitle = document.getElementById("modalTitle")
    const eventTitle = document.getElementById("eventTitle")
    const eventDate = document.getElementById("eventDate")
    const eventTime = document.getElementById("eventTime")
    const eventCategory = document.getElementById("eventCategory")
    const eventLocation = document.getElementById("eventLocation")
    const eventDescription = document.getElementById("eventDescription")
    const eventPriority = document.getElementById("eventPriority")
    const eventReminder = document.getElementById("eventReminder")
    const deleteBtn = document.getElementById("deleteEvent")

    if (!modal) return

    if (event) {
      this.currentEditingEvent = event
      modalTitle.textContent = "Editar Atividade"
      eventTitle.value = event.title
      eventDate.value = event.date
      eventTime.value = event.time || ""
      eventCategory.value = event.category
      eventLocation.value = event.location || ""
      eventDescription.value = event.description || ""
      eventPriority.value = event.priority || "normal"
      eventReminder.checked = event.reminder || false
      deleteBtn.style.display = "block"
    } else {
      this.currentEditingEvent = null
      modalTitle.textContent = "Nova Atividade"
      eventTitle.value = ""
      eventDate.value = this.selectedDate ? this.formatDateToLocalString(this.selectedDate) : ""
      eventTime.value = ""
      eventCategory.value = "meeting"
      eventLocation.value = ""
      eventDescription.value = ""
      eventPriority.value = "normal"
      eventReminder.checked = false
      deleteBtn.style.display = "none"
    }

    modal.classList.add("show")
    document.body.style.overflow = "hidden"

    setTimeout(() => {
      if (eventTitle) eventTitle.focus()
    }, 100)
  }

  closeEventModal() {
    const modal = document.getElementById("eventModal")
    if (modal) {
      modal.classList.remove("show")
      document.body.style.overflow = ""
      this.currentEditingEvent = null
    }
  }

  saveEvent() {
    const title = document.getElementById("eventTitle").value.trim()
    const date = document.getElementById("eventDate").value
    const time = document.getElementById("eventTime").value
    const category = document.getElementById("eventCategory").value
    const location = document.getElementById("eventLocation").value.trim()
    const description = document.getElementById("eventDescription").value.trim()
    const priority = document.getElementById("eventPriority").value
    const reminder = document.getElementById("eventReminder").checked

    if (!title || !date) {
      this.showNotification("Por favor, preencha o título e a data da atividade.", "error")
      return
    }

    if (this.currentEditingEvent) {
      const eventIndex = this.events.findIndex((event) => event.id === this.currentEditingEvent.id)
      if (eventIndex !== -1) {
        this.events[eventIndex] = {
          ...this.events[eventIndex],
          title,
          date,
          time,
          category,
          location,
          description,
          priority,
          reminder,
          updatedAt: new Date().toISOString(),
        }
      }
    } else {
      const newEvent = {
        id: Date.now(),
        title,
        date,
        time,
        category,
        location,
        description,
        priority,
        reminder,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.events.push(newEvent)
    }

    localStorage.setItem("events", JSON.stringify(this.events))
    this.closeEventModal()
    this.renderCalendar()
    this.loadTasksForSelectedDate()
    this.showNotification("Atividade salva com sucesso!", "success")
  }

  editEvent(eventId) {
    const event = this.events.find((e) => e.id === eventId)
    if (event) this.openEventModal(event)
  }

  deleteEvent() {
    if (!this.currentEditingEvent) return
    if (confirm("Tem certeza que deseja excluir esta atividade?")) {
      this.events = this.events.filter((event) => event.id !== this.currentEditingEvent.id)
      localStorage.setItem("events", JSON.stringify(this.events))
      this.closeEventModal()
      this.renderCalendar()
      this.loadTasksForSelectedDate()
      this.showNotification("Atividade excluída com sucesso!", "success")
    }
  }

  showNotification(message, type = "info") {
    const existingNotification = document.querySelector(".notification-toast")
    if (existingNotification) existingNotification.remove()

    const notification = document.createElement("div")
    notification.className = `notification-toast ${type}`
    notification.innerHTML = `
      <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-triangle" : "info-circle"}"></i>
      <span>${message}</span>
    `
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      font-weight: 500;
    `
    document.body.appendChild(notification)

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideOut 0.3s ease-out"
        setTimeout(() => {
          if (notification.parentNode) notification.remove()
        }, 300)
      }
    }, 3000)
  }
}

// Estilos para animação (adicione no CSS ou <style>)
const style = document.createElement("style")
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`
document.head.appendChild(style)

// Inicializar o calendário após o DOM estar pronto
document.addEventListener("DOMContentLoaded", () => {
  window.calendar = new Calendar()
})
