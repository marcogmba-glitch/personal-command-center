import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import App from "./App";
import { initialProjects, isProjects, STORAGE_KEY } from "./model";

describe("Personal Command Center", () => {
  it("shows the four projects and accurate summary", () => {
    render(<App />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4);
    const stats = screen.getByRole("region", { name: "Dashboard summary" });
    expect(stats).toHaveTextContent("Outstanding tasks10");
    expect(stats).toHaveTextContent("Tasks completed2");
  });
  it("adds, edits, completes, and persists a task across remounts", async () => {
    const user = userEvent.setup();
    const app = render(<App />);
    await user.click(screen.getAllByRole("button", { name: "Add a task" })[0]);
    await user.type(screen.getByLabelText("Task name"), "Write launch notes");
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Add task",
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Edit Write launch notes" }),
    );
    await user.clear(screen.getByLabelText("Task name"));
    await user.type(screen.getByLabelText("Task name"), "Publish launch notes");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await user.click(
      screen.getByRole("button", { name: "Complete Publish launch notes" }),
    );
    app.unmount();
    render(<App />);
    expect(
      screen.getByRole("button", { name: "Reopen Publish launch notes" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Write launch notes")).not.toBeInTheDocument();
    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEY)!)
        .flatMap((p: (typeof initialProjects)[number]) => p.tasks)
        .find((t: { title: string }) => t.title === "Publish launch notes")
        .completed,
    ).toBe(true);
  });
  it("limits focus to three and clears focus on completion", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", {
        name: "Add Sketch the onboarding experience to weekly focus",
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("three priorities");
    await user.click(
      screen.getAllByRole("button", {
        name: "Complete Define the MVP feature set",
      })[0],
    );
    await user.click(
      screen.getByRole("button", {
        name: "Add Sketch the onboarding experience to weekly focus",
      }),
    );
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(
      data
        .flatMap((p: (typeof initialProjects)[number]) => p.tasks)
        .filter((t: { focused: boolean }) => t.focused),
    ).toHaveLength(3);
    expect(
      screen.getAllByRole("button", {
        name: "Remove Sketch the onboarding experience from weekly focus",
      }),
    ).toHaveLength(2);
  });
  it("changes project status, filters, and searches", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(
      screen.getByLabelText("Roundly status"),
      "On Hold",
    );
    await user.click(screen.getByRole("button", { name: "On Hold" }));
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1);
    await user.type(
      screen.getByRole("textbox", { name: "Search projects and tasks" }),
      "nothing matches",
    );
    expect(screen.getByText("No projects found")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show all projects" }));
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4);
  });
  it("recovers from malformed storage without crashing", () => {
    localStorage.setItem(STORAGE_KEY, "{invalid");
    render(<App />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Roundly" }),
    ).toBeInTheDocument();
    expect(isProjects([{ ...initialProjects[0], tasks: [null] }])).toBe(false);
  });
});
