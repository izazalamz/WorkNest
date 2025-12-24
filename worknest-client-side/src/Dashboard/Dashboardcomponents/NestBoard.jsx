import React, { useContext, useEffect, useMemo, useState } from "react";
import TaskModal from "./TaskModal";
import { AuthContext } from "../../contexts/AuthContext";
import Loading from "../../components/Loading";

const columns = [
  { key: "todo", title: "To-do" },
  { key: "in-progress", title: "In Progress" },
  { key: "done", title: "Done" },
];

const formatShortDate = (value) => {
  if (!value) return "";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

const NestBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useContext(AuthContext);
  const uid = user?.uid;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          "http://localhost:3000/dashboard/nestboard/tasks",
          {
            headers: { "x-user-uid": uid },
          }
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load tasks.");
        }

        setTasks(data.tasks || []);
      } catch (err) {
        console.error("NestBoard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (uid) fetchTasks();
  }, [uid]);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;

    return tasks.filter((t) => {
      const hay = `${t.title} ${t.description || ""} ${
        t.tag || ""
      }`.toLowerCase();
      return hay.includes(q);
    });
  }, [tasks, search]);

  const tasksByColumn = useMemo(() => {
    const grouped = { todo: [], "in-progress": [], done: [] };
    filteredTasks.forEach((t) => grouped[t.status]?.push(t));
    return grouped;
  }, [filteredTasks]);

  const addTask = async (payload) => {
    try {
      const res = await fetch(
        "http://localhost:3000/dashboard/nestboard/tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-uid": uid,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create task.");
      }

      setTasks((prev) => [data.task, ...prev]);
      setModalOpen(false);
    } catch (err) {
      console.error("Create task error:", err);
    }
  };

  const moveTask = async (taskId, nextStatus) => {
    try {
      const res = await fetch(
        `http://localhost:3000/dashboard/nestboard/tasks/${taskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-uid": uid,
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to move task.");
      }

      setTasks((prev) => prev.map((t) => (t._id === taskId ? data.task : t)));
    } catch (err) {
      console.error("Move task error:", err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const res = await fetch(
        `http://localhost:3000/dashboard/nestboard/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: { "x-user-uid": uid },
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete task.");
      }

      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  if (!uid) {
    return (
      <div className="p-6 text-red-600">
        No user UID found. Please login again.
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <section className="flex-1 flex flex-col min-h-0">
      <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase">
              Board Overview
            </p>
            <h1 className="text-2xl font-bold text-gray-900">NestBoard</h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="search"
                placeholder="Search tasks"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
              onClick={() => setModalOpen(true)}
              type="button"
            >
              + Add Task
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 min-h-0">
        <div className="flex gap-6 h-full overflow-x-auto pb-2">
          {columns.map((col) => {
            const colTasks = tasksByColumn[col.key] || [];

            return (
              <div
                key={col.key}
                className="flex-1 flex flex-col min-w-[320px] max-w-[420px]"
              >
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {col.title}
                  </h2>
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-4  rounded-lg  flex-1 overflow-y-auto ">
                  {colTasks.map((task) => (
                    <div
                      key={task._id}
                      className="bg-white   rounded-lg border border-primary/40 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {task.title}
                          </h3>

                          {task.description && (
                            <p className="text-xs text-gray-600 mt-2 mb-10">
                              {task.description}
                            </p>
                          )}

                          {/* TAG + DATE */}
                          {task.tag || task.dueDate ? (
                            <div className="mt-3 flex flex-wrap gap-4">
                              {task.tag && (
                                <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                  {task.tag}
                                </span>
                              )}

                              {task.dueDate && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  {formatShortDate(task.dueDate)}
                                </span>
                              )}
                            </div>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteTask(task._id)}
                          className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded-md"
                        >
                          Delete
                        </button>
                      </div>

                      <div className="flex gap-2 mt-4">
                        {col.key !== "todo" && (
                          <button
                            type="button"
                            className="text-xs px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
                            onClick={() =>
                              moveTask(
                                task._id,
                                col.key === "done" ? "in-progress" : "todo"
                              )
                            }
                          >
                            ← Back
                          </button>
                        )}

                        {col.key !== "done" && (
                          <button
                            type="button"
                            className="text-xs px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 ml-auto"
                            onClick={() =>
                              moveTask(
                                task._id,
                                col.key === "todo" ? "in-progress" : "done"
                              )
                            }
                          >
                            Next →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="text-sm text-gray-500 bg-white border border-dashed border-gray-200 rounded-lg p-4">
                      No tasks here yet.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addTask}
      />
    </section>
  );
};

export default NestBoard;
