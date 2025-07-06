class DashboardManager {
  constructor() {
    this.activities = JSON.parse(localStorage.getItem("events")) || [];
    this.notes = JSON.parse(localStorage.getItem("notes")) || [];
    this.habits = JSON.parse(localStorage.getItem("habits")) || [];

    this.init();
  }

  init() {
    this.updateStats();
    this.loadUpcomingActivities();
    this.loadRecentNotes();
    this.setupEventListeners();
    this.loadUserInfo();
  }

  loadUserInfo() {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const userAvatarData = localStorage.getItem("userAvatar");

    const userNameEl = document.getElementById("userName");
    const userRoleEl = document.getElementById("userRole");
    const userAvatarEl = document.getElementById("dashboardAvatar");

    if (userNameEl) userNameEl.textContent = user.name || "Usuário Demo";
    if (userRoleEl) userRoleEl.textContent = user.role || "Professor";

    if (userAvatarEl) {
      userAvatarEl.src = userAvatarData
        ? userAvatarData
        : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face";
    }
  }

  updateStats() {
    const totalTasks = this.activities.length;
    const completedTasks = this.activities.filter((a) => a.completed).length;
    const totalNotes = this.notes.length;
    const today = new Date();
    const formattedDate = today.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });

    const totalTasksEl = document.getElementById("totalTasks");
    const completedTasksEl = document.getElementById("completedTasks");
    const totalNotesEl = document.getElementById("totalNotes");
    const streakDaysEl = document.getElementById("streakDays");

    if (totalTasksEl) totalTasksEl.textContent = totalTasks;
    if (completedTasksEl) completedTasksEl.textContent = completedTasks;
    if (totalNotesEl) totalNotesEl.textContent = totalNotes;
    if (streakDaysEl)
      streakDaysEl.textContent =
        formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }

  calculateStreak() {
    if (this.activities.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    const currentDate = new Date(today);

    while (true) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const hasActivity = this.activities.some(
        (activity) => activity.date === dateStr && activity.completed
      );

      if (hasActivity) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  loadUpcomingActivities() {
    const container = document.getElementById("upcomingActivities");
    if (!container) return;

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingActivities = this.activities
      .filter((activity) => {
        const activityDate = new Date(activity.date + "T" + (activity.time || "00:00"));
        return activityDate >= today && activityDate <= nextWeek && !activity.completed;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date + "T" + (a.time || "00:00"));
        const dateB = new Date(b.date + "T" + (b.time || "00:00"));
        return dateA - dateB;
      })
      .slice(0, 5);

    if (upcomingActivities.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-calendar-check"></i>
          <h3>Nenhuma atividade agendada</h3>
          <p>Comece adicionando sua primeira atividade!</p>
          <a href="calendar.html" class="add-first-btn">
            <i class="fas fa-plus"></i>
            Adicionar Primeira Atividade
          </a>
        </div>
      `;
      return;
    }

    const typeIcons = {
      aula: "fas fa-chalkboard-teacher",
      reuniao: "fas fa-users",
      evento: "fas fa-calendar-star",
      tarefa: "fas fa-tasks",
      avaliacao: "fas fa-clipboard-check",
      palestra: "fas fa-microphone",
      workshop: "fas fa-tools",
      entrega: "fas fa-truck",
      pessoal: "fas fa-user",
    };

    const priorityColors = {
      alta: "var(--error)",
      media: "var(--warning)",
      baixa: "var(--success)",
    };

    container.innerHTML = upcomingActivities
      .map((activity) => {
        const activityDate = new Date(activity.date + "T" + (activity.time || "00:00"));
        const isToday = activityDate.toDateString() === today.toDateString();
        const isTomorrow =
          activityDate.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();

        let dateLabel = activityDate.toLocaleDateString("pt-BR");
        if (isToday) dateLabel = "Hoje";
        else if (isTomorrow) dateLabel = "Amanhã";

        return `
          <div class="activity-item" data-id="${activity.id}">
            <div class="activity-icon" style="color: ${priorityColors[activity.priority] || "var(--primary-color)"}">
              <i class="${typeIcons[activity.type] || "fas fa-calendar"}"></i>
            </div>
            <div class="activity-content">
              <h4>${activity.title}</h4>
              <div class="activity-meta">
                <span class="activity-date">
                  <i class="fas fa-calendar"></i>
                  ${dateLabel}
                </span>
                ${
                  activity.time
                    ? `<span class="activity-time"><i class="fas fa-clock"></i> ${activity.time}</span>`
                    : ""
                }
                ${
                  activity.location
                    ? `<span class="activity-location"><i class="fas fa-map-marker-alt"></i> ${activity.location}</span>`
                    : ""
                }
              </div>
            </div>
            <div class="activity-actions">
              <button class="complete-btn" onclick="dashboardManager.completeActivity(${activity.id})" title="Marcar como concluída">
                <i class="fas fa-check"></i>
              </button>
            </div>
          </div>
        `;
      })
      .join("");
  }

  loadRecentNotes() {
    const container = document.getElementById("recentNotes");
    if (!container) return;

    const recentNotes = this.notes
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    if (recentNotes.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-sticky-note"></i>
          <h3>Nenhuma anotação ainda</h3>
          <p>Suas anotações aparecerão aqui</p>
        </div>
      `;
      return;
    }

    container.innerHTML = recentNotes
      .map(
        (note) => `
          <div class="note-item" data-id="${note.id}">
            <div class="note-content">
              <p>${note.content.substring(0, 100)}${note.content.length > 100 ? "..." : ""}</p>
              <small>${new Date(note.createdAt).toLocaleDateString("pt-BR")}</small>
            </div>
          </div>
        `
      )
      .join("");
  }

  completeActivity(activityId) {
    const index = this.activities.findIndex((a) => a.id === Number(activityId));
    if (index !== -1) {
      this.activities[index].completed = true;
      this.activities[index].completedAt = new Date().toISOString();
      localStorage.setItem("events", JSON.stringify(this.activities)); // corrigido para 'events'
      this.updateStats();
      this.loadUpcomingActivities();
      this.showNotification("Atividade marcada como concluída!", "success");
    }
  }

  setupEventListeners() {
    // Dropdown usuário
    const userBtn = document.getElementById("userBtn");
    const userDropdown = document.getElementById("userDropdown");
    if (userBtn && userDropdown) {
      userBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isExpanded = userBtn.getAttribute("aria-expanded") === "true";
        userBtn.setAttribute("aria-expanded", String(!isExpanded));
        userDropdown.classList.toggle("show");
      });

      document.addEventListener("click", () => {
        userDropdown.classList.remove("show");
        userBtn.setAttribute("aria-expanded", "false");
      });
    }

    // Exportar dados
    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportData());
    }

    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.style.display = "none";
      }
    });
  }

  exportData() {
    const data = {
      activities: this.activities,
      notes: this.notes,
      habits: this.habits,
      user: JSON.parse(localStorage.getItem("user") || "{}"),
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `organiza-infinity-backup-${new Date()
      .toISOString()
      .split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showNotification("Dados exportados com sucesso!", "success");
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <i class="fas fa-${
        type === "success"
          ? "check-circle"
          : type === "error"
          ? "exclamation-circle"
          : "info-circle"
      }"></i>
      <span>${message}</span>
    `;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--${type === "success" ? "success" : type === "error" ? "error" : "primary-color"});
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      z-index: 1001;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-out";
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.dashboardManager = new DashboardManager();
});
