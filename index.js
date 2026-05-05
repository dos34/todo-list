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
  constructor(props = {}) {
    this.props = props;
    this._domNode = null;
    this._childComponents = {};
  }

  setProps(props) {
    this.props = props;
    if (this._domNode) {
      this.update();
    }
  }

  createChild(ComponentClass, props = {}, key) {
    const childKey = key !== undefined ? key : ComponentClass.name;
    const existingChild = this._childComponents[childKey];

    if (existingChild && existingChild instanceof ComponentClass) {
      existingChild.setProps(props);
      return existingChild;
    }

    const child = new ComponentClass(props);
    this._childComponents[childKey] = child;
    return child;
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

class AddTask extends Component {
  constructor(props) {
    super(props);

    this.inputText = "";
    this.onInputChange = this.onInputChange.bind(this);
    this.onAddClick = this.onAddClick.bind(this);
  }

  onInputChange(event) {
    this.inputText = event.target.value;
  }

  onAddClick() {
    const text = this.inputText.trim();
    if (!text) {
      return;
    }

    this.props.onAddTask(text);
    this.inputText = "";
    this.update();
  }

  render() {
    return createElement("div", { class: "add-todo" }, [
      createElement(
        "input",
        {
          id: "new-todo",
          type: "text",
          placeholder: "Задание",
          value: this.inputText,
        },
        null,
        [{ event: "input", handler: this.onInputChange }]
      ),
      createElement(
        "button",
        { id: "add-btn" },
        "+",
        [{ event: "click", handler: this.onAddClick }]
      ),
    ]);
  }
}

class Task extends Component {
  constructor(props) {
    super(props);

    this.state = {
      confirmDelete: false,
    };
    this.onDeleteClick = this.onDeleteClick.bind(this);
  }

  onDeleteClick() {
    if (!this.state.confirmDelete) {
      this.state.confirmDelete = true;
      this.update();
      return;
    }

    this.props.onDelete(this.props.index);
  }

  render() {
    return createElement(
      "li",
      { class: this.props.todo.completed ? "completed" : "" },
      [
        createElement(
          "input",
          {
            type: "checkbox",
            checked: this.props.todo.completed,
          },
          null,
          [
            {
              event: "change",
              handler: (event) => this.props.onToggle(this.props.index, event),
            },
          ]
        ),
        createElement("label", {}, this.props.todo.text),
        createElement(
          "button",
          {
            style: this.state.confirmDelete ? "background-color: red; color: #fff;" : "",
          },
          "🗑️",
          [{ event: "click", handler: this.onDeleteClick }]
        ),
      ]
    );
  }
}

class TodoList extends Component {
  constructor() {
    super();

    const savedTodos = window.localStorage.getItem("todo-list");
    let todos = [
      { id: 1, text: "Сделать домашку", completed: false },
      { id: 2, text: "Сделать практику", completed: false },
      { id: 3, text: "Пойти домой", completed: false },
    ];

    if (savedTodos) {
      try {
        const parsed = JSON.parse(savedTodos);
        if (Array.isArray(parsed)) {
          todos = parsed.map((todo, index) => ({
            id: todo.id != null ? todo.id : index + 1,
            text: todo.text,
            completed: todo.completed,
          }));
        }
      } catch (error) {
        console.warn("Не удалось загрузить todos из localStorage", error);
      }
    }

    this.state = {
      todos,
    };
    this.nextTodoId = todos.reduce((maxId, todo) => Math.max(maxId, todo.id), 0) + 1;

    this.onAddTask = this.onAddTask.bind(this);
    this.onToggleTask = this.onToggleTask.bind(this);
    this.onDeleteTask = this.onDeleteTask.bind(this);
  }

  saveTodos() {
    window.localStorage.setItem("todo-list", JSON.stringify(this.state.todos));
  }

  onAddTask(text) {
    this.state.todos.push({ id: this.nextTodoId++, text, completed: false });
    this.saveTodos();
    this.update();
  }

  onToggleTask(index, event) {
    this.state.todos[index].completed = event.target.checked;
    this.saveTodos();
    this.update();
  }

  onDeleteTask(index) {
    this.state.todos.splice(index, 1);
    this.saveTodos();
    this.update();
  }

  render() {
    const todoItems = this.state.todos.map((todo, index) =>
      this.createChild(
        Task,
        {
          todo,
          index,
          onToggle: this.onToggleTask,
          onDelete: this.onDeleteTask,
        },
        todo.id
      ).getDomNode()
    );

    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      this.createChild(AddTask, { onAddTask: this.onAddTask }).getDomNode(),
      createElement("ul", { id: "todos" }, todoItems),
    ]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});
