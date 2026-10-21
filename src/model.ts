export type Status = "Active" | "On Hold" | "Completed";
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  focused: boolean;
}
export interface Project {
  id: string;
  name: string;
  category: string;
  description: string;
  status: Status;
  tasks: Task[];
}
export const STORAGE_KEY = "personal-command-center:v1";
export const initialProjects: Project[] = [
  {
    id: "roundly",
    name: "Roundly",
    category: "Product Development",
    description:
      "Turn a promising idea into a thoughtful product. Build, learn, and keep moving forward.",
    status: "Active",
    tasks: [
      {
        id: "r1",
        title: "Define the MVP feature set",
        completed: false,
        focused: true,
      },
      {
        id: "r2",
        title: "Sketch the onboarding experience",
        completed: false,
        focused: false,
      },
      {
        id: "r3",
        title: "Map the core user journey",
        completed: true,
        focused: false,
      },
    ],
  },
  {
    id: "klarevoyant",
    name: "Klarevoyant",
    category: "Business Development",
    description:
      "Shape the business, find the right opportunities, and build meaningful partnerships.",
    status: "Active",
    tasks: [
      {
        id: "k1",
        title: "Refine the value proposition",
        completed: false,
        focused: true,
      },
      {
        id: "k2",
        title: "Create a shortlist of potential partners",
        completed: false,
        focused: false,
      },
      {
        id: "k3",
        title: "Outline the initial service offering",
        completed: false,
        focused: false,
      },
    ],
  },
  {
    id: "ballett",
    name: "Ballett Akademie",
    category: "Operations & Automation",
    description:
      "Make everyday operations a little smoother. Less admin, more room for what matters.",
    status: "Active",
    tasks: [
      {
        id: "b1",
        title: "Map the student registration process",
        completed: false,
        focused: false,
      },
      {
        id: "b2",
        title: "Identify repetitive admin tasks",
        completed: false,
        focused: false,
      },
      {
        id: "b3",
        title: "Review the current tools and workflows",
        completed: true,
        focused: false,
      },
    ],
  },
  {
    id: "personal",
    name: "Personal Development",
    category: "Learning & Career",
    description:
      "Invest in the skills, habits, and experiences that help you grow with intention.",
    status: "Active",
    tasks: [
      {
        id: "p1",
        title: "Plan this month’s learning goals",
        completed: false,
        focused: true,
      },
      {
        id: "p2",
        title: "Update my portfolio",
        completed: false,
        focused: false,
      },
      {
        id: "p3",
        title: "Set aside time for a weekly reflection",
        completed: false,
        focused: false,
      },
    ],
  },
];
export function isProjects(value: unknown): value is Project[] {
  const ids = new Set<string>();
  let focus = 0;
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every((p) => {
      if (!p || typeof p.id !== "string" || ids.has(p.id)) return false;
      ids.add(p.id);
      const taskIds = new Set<string>();
      return (
        ["name", "category", "description"].every(
          (k) => typeof p[k] === "string",
        ) &&
        ["Active", "On Hold", "Completed"].includes(p.status) &&
        Array.isArray(p.tasks) &&
        p.tasks.every((t: Task) => {
          if (!t || typeof t.id !== "string" || taskIds.has(t.id)) return false;
          taskIds.add(t.id);
          if (t.focused) focus++;
          return (
            typeof t.title === "string" &&
            t.title.trim().length > 0 &&
            typeof t.completed === "boolean" &&
            typeof t.focused === "boolean" &&
            !(t.completed && t.focused) &&
            focus <= 3
          );
        })
      );
    })
  );
}
export function loadProjects(): { projects: Project[]; warning: string } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved)
      return { projects: structuredClone(initialProjects), warning: "" };
    const parsed: unknown = JSON.parse(saved);
    if (isProjects(parsed)) return { projects: parsed, warning: "" };
    return {
      projects: structuredClone(initialProjects),
      warning:
        "Saved data could not be read. Sample projects are shown; your next change will save a new copy.",
    };
  } catch {
    return {
      projects: structuredClone(initialProjects),
      warning:
        "Browser storage is unavailable or unreadable. Changes may only last for this session.",
    };
  }
}
