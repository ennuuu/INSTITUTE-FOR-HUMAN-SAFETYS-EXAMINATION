// update date + time dynamically
function updateClock() {
  const now = new Date();
  const date = now.toLocaleDateString("en-GB"); // dd/mm/yyyy
  const time = now.toLocaleTimeString("en-US", { hour12: false });

  const dateEl = document.getElementById("date");
  const timeEl = document.getElementById("time");

  if (dateEl) dateEl.textContent = date;
  if (timeEl) timeEl.textContent = time;
}

document.addEventListener("DOMContentLoaded", () => {
  updateClock();
  setInterval(updateClock, 1000);
});
