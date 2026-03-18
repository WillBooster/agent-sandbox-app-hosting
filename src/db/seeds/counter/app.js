let count = 0;
const display = document.getElementById("count");
document.getElementById("increment").addEventListener("click", () => {
  display.textContent = ++count;
});
document.getElementById("decrement").addEventListener("click", () => {
  display.textContent = --count;
});
document.getElementById("reset").addEventListener("click", () => {
  count = 0;
  display.textContent = count;
});
