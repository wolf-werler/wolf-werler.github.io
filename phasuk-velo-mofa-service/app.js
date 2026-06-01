(function () {
  const hours = {
    0: null,
    1: null,
    2: { open: 8 * 60 + 30, close: 18 * 60 + 30 },
    3: { open: 8 * 60 + 30, close: 18 * 60 + 30 },
    4: { open: 8 * 60 + 30, close: 18 * 60 + 30 },
    5: { open: 8 * 60 + 30, close: 18 * 60 + 30 },
    6: { open: 8 * 60 + 30, close: 16 * 60 },
  };

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Zurich",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const weekday = parts.find((part) => part.type === "weekday")?.value;
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const today = dayMap[weekday] ?? new Date().getDay();
  const schedule = hours[today];
  const currentMinutes = hour * 60 + minute;
  const isOpen = Boolean(schedule && currentMinutes >= schedule.open && currentMinutes < schedule.close);

  document.querySelectorAll("[data-day]").forEach((row) => {
    if (Number(row.dataset.day) === today) {
      row.classList.add("is-today");
    }
  });

  const status = document.querySelector("[data-open-status]");
  if (status) {
    if (isOpen && schedule) {
      const closeHour = String(Math.floor(schedule.close / 60)).padStart(2, "0");
      const closeMinute = String(schedule.close % 60).padStart(2, "0");
      status.textContent = `Heute geöffnet bis ${closeHour}:${closeMinute}`;
    } else if (schedule && currentMinutes < schedule.open) {
      status.textContent = "Heute ab 08:30 geöffnet";
    } else {
      status.textContent = "Heute geschlossen";
    }
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
})();
