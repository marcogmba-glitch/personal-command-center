import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCheck,
  ChevronRight,
  Command,
  Flag,
  FolderKanban,
  LayoutDashboard,
  Plus,
  Search,
  Sparkles,
  Target,
  X,
  Pencil,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { loadProjects, STORAGE_KEY } from "./model";
import type { Project, Status, Task } from "./model";

const projectIcons = [Layers, Sparkles, Command, BookOpen];
export default function App() {
  const [loaded] = useState(loadProjects);
  const [projects, setProjects] = useState(loaded.projects);
  const [warning, setWarning] = useState(loaded.warning);
  const [view, setView] = useState("Overview");
  const [filter, setFilter] = useState("All projects");
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<{
    projectId: string;
    task?: Task;
  } | null>(null);
  const [title, setTitle] = useState("");
  const [notice, setNotice] = useState("");
  const allTasks = projects.flatMap((p) =>
    p.tasks.map((t) => ({ ...t, project: p })),
  );
  const focus = allTasks.filter((t) => t.focused && !t.completed);
  const outstanding = allTasks.filter((t) => !t.completed).length;
  const completed = allTasks.filter((t) => t.completed).length;
  function save(next: Project[]) {
    setProjects(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setWarning("");
    } catch {
      setWarning(
        "Changes are kept for this session, but could not be saved to browser storage.",
      );
    }
  }
  function updateTask(projectId: string, taskId: string, patch: Partial<Task>) {
    save(
      projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId ? { ...t, ...patch } : t,
              ),
            }
          : p,
      ),
    );
  }
  function toggleFocus(projectId: string, task: Task) {
    if (!task.focused && focus.length >= 3) {
      setNotice(
        "Your week has room for three priorities. Unpin a task to make space.",
      );
      return;
    }
    setNotice("");
    updateTask(projectId, task.id, { focused: !task.focused });
  }
  function openEditor(projectId: string, task?: Task) {
    setEditor({ projectId, task });
    setTitle(task?.title ?? "");
  }
  function submitTask(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !editor) return;
    if (editor.task)
      updateTask(editor.projectId, editor.task.id, { title: title.trim() });
    else
      save(
        projects.map((p) =>
          p.id === editor.projectId
            ? {
                ...p,
                tasks: [
                  ...p.tasks,
                  {
                    id: crypto.randomUUID(),
                    title: title.trim(),
                    completed: false,
                    focused: false,
                  },
                ],
              }
            : p,
        ),
      );
    setEditor(null);
  }
  const visibleProjects = projects.filter(
    (p) =>
      (filter === "All projects" || p.status === filter) &&
      `${p.name} ${p.category} ${p.tasks.map((t) => t.title).join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  function navigate(next: string) {
    setView(next);
    setNotice("");
    setQuery("");
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("Overview");
          }}
        >
          <span className="brand-icon">
            <Command size={22} />
          </span>
          <span>
            Command
            <span className="brand-secondary">
              Center<span className="brand-dot">.</span>
            </span>
          </span>
        </a>
        <div className="workspace-label">PERSONAL WORKSPACE</div>
        <nav aria-label="Main navigation">
          {[
            { name: "Overview", icon: LayoutDashboard },
            { name: "Projects", icon: FolderKanban },
            { name: "Weekly focus", icon: Target },
          ].map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => navigate(name)}
              className={`nav-item ${view === name ? "selected" : ""}`}
            >
              <Icon size={18} />
              {name}
              {name === "Projects" && <span className="nav-count">4</span>}
              {view === name && <span className="active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-projects">
          <div className="workspace-label">
            YOUR PROJECTS <span>4</span>
          </div>
          {projects.map((p, i) => (
            <button
              key={p.id}
              onClick={() => {
                navigate("Projects");
                setFilter("All projects");
                setQuery(p.name);
              }}
            >
              <span className={`project-dot color-${i}`} />
              {p.name}
              <ChevronRight size={13} />
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="local-badge">
            <span className="green-dot" /> A space that’s just yours
          </div>
          <p>Stored locally. Built for focus.</p>
          <div className="profile">
            <div className="avatar">M</div>
            <div>
              My workspace<small>Personal account</small>
            </div>
            <span className="version">v0.1</span>
          </div>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <ChevronRight size={13} />
            <span>{view}</span>
          </div>
          <div className="topbar-right">
            <span className="private-indicator">
              <span className="green-dot" />
              Local workspace
            </span>
            <div className="avatar small">M</div>
          </div>
        </header>
        <div className="main-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow">
                A LITTLE CLARITY. A LOT OF POSSIBILITY.
              </div>
              <h1>
                {view === "Overview"
                  ? "Your big picture"
                  : view === "Projects"
                    ? "Your projects"
                    : "Focus this week"}
                <span className="heading-dot">.</span>
              </h1>
              <p>
                {view === "Overview"
                  ? "Good things start with a clear next step. Here’s yours."
                  : view === "Projects"
                    ? "Four directions. One place to keep things moving."
                    : "Make space for the three things that matter most."}
              </p>
            </div>
            <div className="today">
              <span>
                {new Intl.DateTimeFormat("en", { weekday: "long" }).format(
                  new Date(),
                )}
              </span>
              {new Intl.DateTimeFormat("en", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }).format(new Date())}
            </div>
          </section>
          {warning && (
            <div className="message warning" role="alert">
              {warning}
            </div>
          )}
          {notice && (
            <div className="message" role="status">
              {notice}
              <button
                aria-label="Dismiss message"
                onClick={() => setNotice("")}
              >
                <X size={15} />
              </button>
            </div>
          )}
          {view === "Overview" && (
            <section className="stats" aria-label="Dashboard summary">
              <div className="stat">
                <span className="stat-icon blue">
                  <FolderKanban size={19} />
                </span>
                <div>
                  <span className="stat-label">Active projects</span>
                  <strong>
                    {projects.filter((p) => p.status === "Active").length}
                    <small>/ {projects.length}</small>
                  </strong>
                </div>
                <span className="stat-foot">Ideas in motion</span>
              </div>
              <div className="stat">
                <span className="stat-icon amber">
                  <CheckCheck size={19} />
                </span>
                <div>
                  <span className="stat-label">Outstanding tasks</span>
                  <strong>{outstanding}</strong>
                </div>
                <span className="stat-foot">One step at a time</span>
              </div>
              <div className="stat">
                <span className="stat-icon teal">
                  <Target size={19} />
                </span>
                <div>
                  <span className="stat-label">Weekly priorities</span>
                  <strong>
                    {focus.length}
                    <small>/ 3</small>
                  </strong>
                </div>
                <span className="stat-foot">
                  Keep the important things close
                </span>
              </div>
              <div className="stat">
                <span className="stat-icon purple">
                  <CheckCircle2 size={19} />
                </span>
                <div>
                  <span className="stat-label">Tasks completed</span>
                  <strong>{completed}</strong>
                </div>
                <span className="stat-foot">Progress worth recognizing</span>
              </div>
            </section>
          )}
          {view !== "Projects" && (
            <section className="focus-section">
              <div className="section-heading">
                <h2>
                  <Target size={19} /> Focus this week{" "}
                  <span className="count-badge">{focus.length}/3</span>
                </h2>
                <span className="section-hint">Less, but better.</span>
              </div>
              <div className="focus-grid">
                {focus.map((t, i) => (
                  <div className="focus-card" key={t.id}>
                    <div className="focus-card-top">
                      <span className="priority-number">0{i + 1}</span>
                      <button
                        className="icon-button pin active"
                        aria-label={`Remove ${t.title} from weekly focus`}
                        onClick={() => toggleFocus(t.project.id, t)}
                      >
                        <Flag size={15} />
                      </button>
                    </div>
                    <div className="focus-task">
                      <button
                        className="task-check"
                        aria-label={`Complete ${t.title}`}
                        onClick={() =>
                          updateTask(t.project.id, t.id, {
                            completed: true,
                            focused: false,
                          })
                        }
                      />
                      <span>{t.title}</span>
                    </div>
                    <div className="focus-project">
                      <span
                        className={`project-dot color-${projects.findIndex((p) => p.id === t.project.id)}`}
                      />
                      {t.project.name}
                      <ArrowUpRight size={13} />
                    </div>
                  </div>
                ))}
                {Array.from({ length: 3 - focus.length }, (_, i) => (
                  <button
                    key={`empty-${i}`}
                    className="focus-empty"
                    onClick={() => {
                      navigate("Projects");
                      setFilter("All projects");
                    }}
                  >
                    <Plus size={22} />
                    <span>Make room for what matters</span>
                    <small>Flag a task from your projects</small>
                  </button>
                ))}
              </div>
              <div className="focus-note">
                <Flag size={12} /> Use the flag next to any task to bring it
                into focus. Three priorities, a clearer week.
              </div>
            </section>
          )}
          {view !== "Weekly focus" && (
            <section className="projects-section">
              <div className="section-heading">
                <h2>
                  <FolderKanban size={19} /> Your projects{" "}
                  <span className="count-badge">{projects.length}</span>
                </h2>
                <span className="section-hint">A home for every ambition</span>
              </div>
              <div className="project-toolbar">
                <div className="filters" aria-label="Filter projects">
                  {["All projects", "Active", "On Hold", "Completed"].map(
                    (f) => (
                      <button
                        key={f}
                        aria-pressed={filter === f}
                        className={filter === f ? "chosen" : ""}
                        onClick={() => setFilter(f)}
                      >
                        {f}
                      </button>
                    ),
                  )}
                </div>
                <label className="search">
                  <Search size={15} />
                  <input
                    aria-label="Search projects and tasks"
                    placeholder="Find a project or task…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                    <button
                      aria-label="Clear search"
                      onClick={() => setQuery("")}
                    >
                      <X size={14} />
                    </button>
                  )}
                </label>
              </div>
              <div className="projects-grid">
                {visibleProjects.map((p) => {
                  const index = projects.findIndex((item) => item.id === p.id);
                  const Icon = projectIcons[index];
                  const done = p.tasks.filter((t) => t.completed).length;
                  return (
                    <article
                      key={p.id}
                      className={`project-card project-${index}`}
                    >
                      <div className="project-card-header">
                        <span className={`project-icon color-${index}`}>
                          <Icon size={22} />
                        </span>
                        <label
                          className={`status-select status-${p.status.replace(" ", "-").toLowerCase()}`}
                        >
                          <span className="status-dot" />
                          <select
                            aria-label={`${p.name} status`}
                            value={p.status}
                            onChange={(e) =>
                              save(
                                projects.map((item) =>
                                  item.id === p.id
                                    ? {
                                        ...item,
                                        status: e.target.value as Status,
                                      }
                                    : item,
                                ),
                              )
                            }
                          >
                            {["Active", "On Hold", "Completed"].map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <h3>{p.name}</h3>
                      <div className="category">{p.category}</div>
                      <p className="description">{p.description}</p>
                      <div className="progress-label">
                        <span>Project progress</span>
                        <span>
                          {done}
                          <span className="muted">
                            {" "}
                            / {p.tasks.length} tasks
                          </span>
                        </span>
                      </div>
                      <div className="progress-track">
                        <div
                          style={{
                            width: `${p.tasks.length ? (done / p.tasks.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <div className="task-heading">
                        NEXT ACTIONS{" "}
                        <span>
                          {p.tasks.filter((t) => !t.completed).length} remaining
                        </span>
                      </div>
                      <ul className="task-list">
                        {p.tasks.map((t) => (
                          <li
                            key={t.id}
                            className={t.completed ? "completed" : ""}
                          >
                            <button
                              className="task-check"
                              aria-label={`${t.completed ? "Reopen" : "Complete"} ${t.title}`}
                              onClick={() =>
                                updateTask(p.id, t.id, {
                                  completed: !t.completed,
                                  focused: false,
                                })
                              }
                            >
                              {t.completed && <Check size={12} />}
                            </button>
                            <span className="task-title">{t.title}</span>
                            <div className="task-actions">
                              <button
                                className="icon-button edit"
                                aria-label={`Edit ${t.title}`}
                                onClick={() => openEditor(p.id, t)}
                              >
                                <Pencil size={13} />
                              </button>
                              {!t.completed && (
                                <button
                                  className={`icon-button pin ${t.focused ? "active" : ""}`}
                                  aria-pressed={t.focused}
                                  aria-label={`${t.focused ? "Remove" : "Add"} ${t.title} ${t.focused ? "from" : "to"} weekly focus`}
                                  onClick={() => toggleFocus(p.id, t)}
                                >
                                  <Flag size={13} />
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                      <button
                        className="add-task"
                        onClick={() => openEditor(p.id)}
                      >
                        <Plus size={15} /> Add a task
                      </button>
                    </article>
                  );
                })}
              </div>
              {visibleProjects.length === 0 && (
                <div className="empty-state">
                  <Search size={25} />
                  <h3>No projects found</h3>
                  <p>Try another search or choose a different status.</p>
                  <button
                    onClick={() => {
                      setQuery("");
                      setFilter("All projects");
                    }}
                  >
                    Show all projects
                  </button>
                </div>
              )}
            </section>
          )}
          <footer>
            <span>
              <Command size={13} /> Personal Command Center
            </span>
            <span>
              A little progress, every day.<span className="footer-dot">•</span>
              v0.1
            </span>
          </footer>
        </div>
      </main>
      {editor && (
        <div className="modal-backdrop" onClick={() => setEditor(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-dialog-title"
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setEditor(null);
              if (e.key === "Tab") {
                const nodes =
                  e.currentTarget.querySelectorAll<HTMLElement>(
                    "button, input",
                  );
                const first = nodes[0];
                const last = nodes[nodes.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                }
              }
            }}
          >
            <div className="modal-header">
              <h2 id="task-dialog-title">
                {editor.task ? "Edit task" : "A clear next step"}
              </h2>
              <button
                className="icon-button"
                aria-label="Close task editor"
                onClick={() => setEditor(null)}
              >
                <X size={19} />
              </button>
            </div>
            <p>{projects.find((p) => p.id === editor.projectId)?.name}</p>
            <form onSubmit={submitTask}>
              <label htmlFor="task-title">Task name</label>
              <input
                autoFocus
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                placeholder="What needs to happen next?"
                required
              />
              <div className="modal-footer">
                <button type="button" onClick={() => setEditor(null)}>
                  Cancel
                </button>
                <button
                  className="primary-button"
                  type="submit"
                  disabled={!title.trim()}
                >
                  {editor.task ? "Save changes" : "Add task"}
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
