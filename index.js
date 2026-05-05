function createElement(tag, attributes, children, callbacks) {
  const element = document.createElement(tag);

  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      const value = attributes[key];
      if (typeof value === "boolean") {
        element[key] = value;
        if (value) {
          element.setAttribute(key, "");
        } else {
          element.removeAttribute(key);
        }
      } else {
        element.setAttribute(key, value);
      }
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
    this._domNode = null;
  }

  getDomNode() {
    if (!this._domNode) {
      this._domNode = this.render();
    }
    return this._domNode;
  }

  update() {
    const newDomNode = this.render();
    if (this._domNode && this._domNode.parentNode) {
      this._domNode.parentNode.replaceChild(newDomNode, this._domNode);
    }
    this._domNode = newDomNode;
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
    this.update();
  }

  onToggleTask(index, event) {
    this.state.todos[index].completed = event.target.checked;
    this.update();
  }

  onDeleteTask(index) {
    this.state.todos.splice(index, 1);
    this.update();
  }

  render() {
    const todoItems = this.state.todos.map((todo, index) =>
      createElement(
        "li",
        { class: todo.completed ? "completed" : "" },
        [
          createElement("input", {
            type: "checkbox",
            checked: todo.completed,
          }, null, [
            {
              event: "change",
              handler: (event) => this.onToggleTask(index, event),
            },
          ]),
          createElement("label", {}, todo.text),
          createElement(
            "button",
            {},
            "🗑️",
            [{ event: "click", handler: () => this.onDeleteTask(index) }]
          ),
        ]
      )
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
