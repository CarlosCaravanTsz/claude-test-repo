import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolInvocation: {
    toolName: string;
    args: any;
    state: string;
    result?: any;
  };
}

function getFileName(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] || "/";
}

function getToolMessage(toolName: string, args: any): string {
  if (toolName === "str_replace_editor") {
    const { command, path } = args || {};
    if (!path) return toolName;

    const filename = getFileName(path);

    switch (command) {
      case "create":
        return `Creating ${filename}`;
      case "str_replace":
        return `Editing ${filename}`;
      case "insert":
        return `Adding to ${filename}`;
      case "view":
        return `Reading ${filename}`;
      default:
        return toolName;
    }
  }

  if (toolName === "file_manager") {
    const { command, path, new_path } = args || {};
    if (!path) return toolName;

    const oldFilename = getFileName(path);

    switch (command) {
      case "rename":
        if (new_path) {
          const newFilename = getFileName(new_path);
          return `Renaming ${oldFilename} to ${newFilename}`;
        }
        return `Renaming ${oldFilename}`;
      case "delete":
        return `Deleting ${oldFilename}`;
      default:
        return toolName;
    }
  }

  return toolName;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const message = getToolMessage(toolInvocation.toolName, toolInvocation.args);
  const isCompleted = toolInvocation.state === "result" && toolInvocation.result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isCompleted ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{message}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{message}</span>
        </>
      )}
    </div>
  );
}
