import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Check, ListTodo, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/app/shared/ui/button";
import { Input } from "@/app/shared/ui/input";
import { Badge } from "@/app/shared/ui/badge";
import { Skeleton } from "@/app/shared/ui/skeleton";
import { useOrg } from "../context/OrgContext";
import { useAuth } from "@/app/context/AuthContext";
import { listTasks, createTask, updateTask, deleteTask } from "@/lib/orgs/tasks";
import { listMembers } from "@/lib/orgs/members";
import { TaskRecord, OrgMember } from "@/lib/types/ats";

type TaskStatus = TaskRecord["status"];

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "E re",
  in_progress: "Në progres",
  done: "Kryer",
};

const STATUS_VARIANTS: Record<TaskStatus, "secondary" | "default" | "outline"> = {
  todo: "secondary",
  in_progress: "default",
  done: "outline",
};

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};

const COLUMNS: TaskStatus[] = ["todo", "in_progress", "done"];

export default function TasksPage() {
  const { orgId } = useOrg();
  const { user } = useAuth();

  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const memberMap = useMemo(
    () => Object.fromEntries(members.map((m) => [m.uid, m])),
    [members]
  );

  const reload = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [taskList, memberList] = await Promise.all([
        listTasks(orgId),
        listMembers(orgId),
      ]);
      setTasks(taskList);
      setMembers(memberList);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!orgId || !title.trim() || !user) return;
    setCreating(true);
    try {
      await createTask(orgId, {
        title: title.trim(),
        status: "todo",
        assigneeUid: user.id,
        createdAt: new Date().toISOString(),
      });
      setTitle("");
      reload();
      toast.success("Detyra u shtua.");
    } catch {
      toast.error("Detyra nuk u ruajt.");
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (task: TaskRecord, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status } : t));
    try {
      await updateTask(orgId!, task.id, { status });
    } catch {
      toast.error("Statusi nuk u ndryshua.");
      reload();
    }
  };

  const handleDeleteTask = async (task: TaskRecord) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      await deleteTask(orgId!, task.id);
      toast.success("Detyra u fshi.");
    } catch {
      toast.error("Detyra nuk u fshi.");
      reload();
    }
  };

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, TaskRecord[]> = { todo: [], in_progress: [], done: [] };
    tasks.forEach((t) => map[t.status].push(t));
    return map;
  }, [tasks]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Detyrat</h1>
        {!loading && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {tasks.filter((t) => t.status !== "done").length} aktive · {tasks.length} gjithsej
          </p>
        )}
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Detyrë e re..."
          className="h-9 max-w-sm text-sm"
          disabled={creating}
        />
        <Button type="submit" size="sm" disabled={!title.trim() || creating}>
          <Plus className="size-4 mr-1.5" />
          {creating ? "Duke shtuar..." : "Shto detyrë"}
        </Button>
      </form>

      {/* Columns */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col} className="space-y-2">
              <Skeleton className="h-5 w-24" />
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const colTasks = tasksByStatus[col];
            return (
              <div key={col} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {STATUS_LABELS[col]}
                  </h2>
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2 min-h-[80px]">
                  {colTasks.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-center">
                      <p className="text-xs text-muted-foreground/60">Bosh</p>
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const assignee = task.assigneeUid ? memberMap[task.assigneeUid] : null;
                      const next = NEXT_STATUS[task.status];
                      return (
                        <div
                          key={task.id}
                          className="rounded-lg border bg-card p-3 shadow-sm space-y-2"
                        >
                          <p className={[
                            "text-sm leading-snug",
                            task.status === "done" ? "line-through text-muted-foreground" : "",
                          ].join(" ")}>
                            {task.title}
                          </p>

                          <div className="flex items-center justify-between gap-2">
                            {assignee && (
                              <span className="text-[10px] text-muted-foreground truncate">
                                {assignee.displayName ?? assignee.email ?? assignee.uid}
                              </span>
                            )}
                            <Badge variant={STATUS_VARIANTS[task.status]} className="text-[10px] py-0 px-1.5 h-4 shrink-0 ml-auto">
                              {STATUS_LABELS[task.status]}
                            </Badge>
                          </div>

                          <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-6 text-[10px] gap-1"
                            onClick={() => handleStatusChange(task, next)}
                          >
                            {next === "done" ? (
                              <><Check className="size-3" /> Kryer</>
                            ) : next === "in_progress" ? (
                              <>→ Progres</>
                            ) : (
                              <>↺ Rihap</>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => handleDeleteTask(task)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <ListTodo className="size-10 text-muted-foreground opacity-30" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nuk ka detyra ende</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Shtoni detyrën e parë duke përdorur formularin më sipër.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
