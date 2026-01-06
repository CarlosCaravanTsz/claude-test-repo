import { describe, it, expect, afterEach } from "vitest";
import { render, screen, within, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

describe("ToolInvocationBadge", () => {
  describe("str_replace_editor tool", () => {
    it("displays 'Creating {filename}' for create command with completed state", () => {
      const toolInvocation = {
        toolName: "str_replace_editor",
        args: {
          command: "create",
          path: "/Card.jsx",
          file_text: "export default function Card() {}",
        },
        state: "result",
        result: "Success",
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Creating Card.jsx")).toBeDefined();
    });

    it("displays 'Creating {filename}' for create command with in-progress state", () => {
      const toolInvocation = {
        toolName: "str_replace_editor",
        args: {
          command: "create",
          path: "/App.jsx",
          file_text: "export default function App() {}",
        },
        state: "pending",
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Creating App.jsx")).toBeDefined();
    });

    it("displays 'Editing {filename}' for str_replace command", () => {
      const toolInvocation = {
        toolName: "str_replace_editor",
        args: {
          command: "str_replace",
          path: "/components/Button.jsx",
          old_str: "old code",
          new_str: "new code",
        },
        state: "result",
        result: "Success",
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Editing Button.jsx")).toBeDefined();
    });

    it("displays 'Adding to {filename}' for insert command", () => {
      const toolInvocation = {
        toolName: "str_replace_editor",
        args: {
          command: "insert",
          path: "/utils/helpers.js",
          insert_line: 5,
          new_str: "// New comment\n",
        },
        state: "result",
        result: "Success",
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Adding to helpers.js")).toBeDefined();
    });

    it("displays 'Reading {filename}' for view command", () => {
      const toolInvocation = {
        toolName: "str_replace_editor",
        args: {
          command: "view",
          path: "/config/settings.json",
          view_range: [1, 50],
        },
        state: "result",
        result: "Success",
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Reading settings.json")).toBeDefined();
    });

    it("handles nested file paths correctly", () => {
      const toolInvocation = {
        toolName: "str_replace_editor",
        args: {
          command: "create",
          path: "/components/ui/Button.tsx",
          file_text: "export const Button = () => {}",
        },
        state: "result",
        result: "Success",
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Creating Button.tsx")).toBeDefined();
    });

    it("handles root-level files", () => {
      const toolInvocation = {
        toolName: "str_replace_editor",
        args: {
          command: "create",
          path: "/index.js",
          file_text: "console.log('Hello')",
        },
        state: "result",
        result: "Success",
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Creating index.js")).toBeDefined();
    });
  });

  describe("file_manager tool", () => {
    it("displays 'Renaming {old} to {new}' for rename command", () => {
      const toolInvocation = {
        toolName: "file_manager",
        args: {
          command: "rename",
          path: "/old-file.jsx",
          new_path: "/new-file.jsx",
        },
        state: "result",
        result: "Success",
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Renaming old-file.jsx to new-file.jsx")).toBeDefined();
    });

    it("displays 'Renaming {filename}' when new_path is missing", () => {
      const toolInvocation = {
        toolName: "file_manager",
        args: {
          command: "rename",
          path: "/test.jsx",
        },
        state: "result",
        result: "Success",
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Renaming test.jsx")).toBeDefined();
    });

    it("displays 'Deleting {filename}' for delete command", () => {
      const toolInvocation = {
        toolName: "file_manager",
        args: {
          command: "delete",
          path: "/temp-file.js",
        },
        state: "result",
        result: "Success",
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Deleting temp-file.js")).toBeDefined();
    });

    it("handles nested paths in file_manager operations", () => {
      const toolInvocation = {
        toolName: "file_manager",
        args: {
          command: "delete",
          path: "/components/legacy/OldButton.jsx",
        },
        state: "result",
        result: "Success",
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Deleting OldButton.jsx")).toBeDefined();
    });
  });

  describe("state indicators", () => {
    it("shows green dot when tool is completed (state=result with result)", () => {
      const toolInvocation = {
        toolName: "str_replace_editor",
        args: {
          command: "create",
          path: "/test.js",
          file_text: "test",
        },
        state: "result",
        result: "Success",
      };

      const { container } = render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      const greenDot = container.querySelector(".bg-emerald-500");
      expect(greenDot).toBeDefined();
    });

    it("shows spinner when tool is in progress", () => {
      const toolInvocation = {
        toolName: "str_replace_editor",
        args: {
          command: "create",
          path: "/test.js",
          file_text: "test",
        },
        state: "pending",
      };

      const { container } = render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeDefined();
    });

    it("shows spinner when state is result but result is missing", () => {
      const toolInvocation = {
        toolName: "str_replace_editor",
        args: {
          command: "create",
          path: "/test.js",
          file_text: "test",
        },
        state: "result",
      };

      const { container } = render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeDefined();
    });
  });

  describe("fallback behavior", () => {
    it("displays tool name when tool is unknown", () => {
      const toolInvocation = {
        toolName: "unknown_tool",
        args: {
          some: "data",
        },
        state: "result",
        result: "Success",
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("unknown_tool")).toBeDefined();
    });

    it("displays tool name when args are missing", () => {
      const toolInvocation = {
        toolName: "str_replace_editor",
        args: null,
        state: "result",
        result: "Success",
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("str_replace_editor")).toBeDefined();
    });

    it("displays tool name when path is missing from args", () => {
      const toolInvocation = {
        toolName: "str_replace_editor",
        args: {
          command: "create",
        },
        state: "result",
        result: "Success",
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("str_replace_editor")).toBeDefined();
    });

    it("displays tool name when command is unknown", () => {
      const toolInvocation = {
        toolName: "str_replace_editor",
        args: {
          command: "unknown_command",
          path: "/test.js",
        },
        state: "result",
        result: "Success",
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("str_replace_editor")).toBeDefined();
    });
  });

  describe("edge cases", () => {
    it("handles path with only slashes", () => {
      const toolInvocation = {
        toolName: "str_replace_editor",
        args: {
          command: "create",
          path: "/",
          file_text: "test",
        },
        state: "result",
        result: "Success",
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Creating /")).toBeDefined();
    });

    it("handles path with multiple consecutive slashes", () => {
      const toolInvocation = {
        toolName: "str_replace_editor",
        args: {
          command: "create",
          path: "///components///Button.jsx",
          file_text: "test",
        },
        state: "result",
        result: "Success",
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Creating Button.jsx")).toBeDefined();
    });
  });
});
