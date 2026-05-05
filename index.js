function createElement(tag, attributes, children, callbacks) {
  const element = document.createElement(tag);

  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      element.setAttribute(key, attributes[key]);
    });
  }

  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });
  } else if (typeof children === "string") {
    element.appendChild(document.createTextNode(children));
  } else if (children instanceof HTMLElement) {
    element.appendChild(children);
  }

  if (Array.isArray(callbacks)) {
    callbacks.forEach(({ event, handler }) => {
      element.addEventListener(event, handler);
    });
  }

  return element;
}

class Component {
  constructor() {
  }

  getDomNode() {
    this._domNode = this.render();
    return this._domNode;
  }
}

class TodoList extends Component {
  constructor() {
    super();

    this.state = {
      todos: [
        { text: "Сделать домашку", completed: false },
        { text: "Сделать практику", completed: false },
        { text: "Пойти домой", completed: false },
      ],
      newTaskText: "",
    };

    this.onAddTask = this.onAddTask.bind(this);
    this.onAddInputChange = this.onAddInputChange.bind(this);
  }

  onAddInputChange(event) {
    this.state.newTaskText = event.target.value;
  }

  onAddTask() {
    const text = this.state.newTaskText.trim();
    if (!text) {
      return;
    }

    this.state.todos.push({ text, completed: false });
    this.state.newTaskText = "";
  }

  render() {
    const todoItems = this.state.todos.map((todo) =>
      createElement("li", {}, [
        createElement("input", { type: "checkbox", checked: todo.completed }),
        createElement("label", {}, todo.text),
        createElement("button", {}, "🗑️"),
      ])
    );

    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      createElement("div", { class: "add-todo" }, [
        createElement(
          "input",
          {
            id: "new-todo",
            type: "text",
            placeholder: "Задание",
            value: this.state.newTaskText,
          },
          null,
          [{ event: "input", handler: this.onAddInputChange }]
        ),
        createElement(
          "button",
          { id: "add-btn" },
          "+",
          [{ event: "click", handler: this.onAddTask }]
        ),
      ]),
      createElement("ul", { id: "todos" }, todoItems),
    ]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});
