const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const emptyMsg = document.getElementById("empty-message");
let todos = JSON.parse(localStorage.getItem("todos") || "[]");

function save() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function render() {
  list.innerHTML = "";
  emptyMsg.style.display = todos.length === 0 ? "block" : "none";
  todos.forEach((t, i) => {
    const li = document.createElement("li");
    if (t.done) li.classList.add("done");
    li.innerHTML = `<input type="checkbox" ${t.done ? "checked" : ""}><span>${t.text}</span><button>削除</button>`;
    li.querySelector("input").addEventListener("change", () => {
      todos[i].done = !todos[i].done;
      save();
      render();
    });
    li.querySelector("button").addEventListener("click", () => {
      todos.splice(i, 1);
      save();
      render();
    });
    list.appendChild(li);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!input.value.trim()) return;
  todos.push({ text: input.value.trim(), done: false });
  input.value = "";
  save();
  render();
});

render();
