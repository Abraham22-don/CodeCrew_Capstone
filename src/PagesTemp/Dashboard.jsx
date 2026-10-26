import { useState } from "react";

function Dashboard() {
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: "Computer Architecture Homework",
      completed: false,
    },
    {
      id: 2,
      title: "Study for Upcoming Exam",
      completed: false,
    },
    {
      id: 3,
      title: "React Capstone Project",
      completed: false,
    },
  ]);

  const [newAssignment, setNewAssignment] = useState("");

  function addAssignment(event) {
    event.preventDefault();

    if (newAssignment.trim() === "") {
      return;
    }

    const assignment = {
      id: Date.now(),
      title: newAssignment.trim(),
      completed: false,
    };

    setAssignments([...assignments, assignment]);
    setNewAssignment("");
  }

  function toggleComplete(id) {
    setAssignments(
      assignments.map((assignment) =>
        assignment.id === id
          ? {
              ...assignment,
              completed: !assignment.completed,
            }
          : assignment
      )
    );
  }

  function deleteAssignment(id) {
    setAssignments(
      assignments.filter((assignment) => assignment.id !== id)
    );
  }

  const completedCount = assignments.filter(
    (assignment) => assignment.completed
  ).length;

  const progress =
    assignments.length === 0
      ? 0
      : Math.round((completedCount / assignments.length) * 100);

  return (
    <section className="page">
      <p style={{ color: "#34d399", fontWeight: "bold" }}>
        YOUR WORKSPACE
      </p>

      <h1>Student Dashboard</h1>

      <p className="subtitle">
        Organize assignments, complete tasks, and track your progress.
      </p>

      <div className="card">
        <h2>Assignment Progress</h2>

        <p>
          Completed: {completedCount} of {assignments.length} assignments
        </p>

        <div
          style={{
            width: "100%",
            height: "12px",
            backgroundColor: "#334155",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #2563eb, #a855f7)",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <p style={{ color: "#34d399" }}>
          {progress}% Complete
        </p>
      </div>

      <div className="card">
        <h2>Add an Assignment</h2>

        <form
          onSubmit={addAssignment}
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            value={newAssignment}
            onChange={(event) => setNewAssignment(event.target.value)}
            placeholder="Enter assignment name..."
            aria-label="New assignment name"
            style={{
              flex: "1",
              minWidth: "200px",
              padding: "13px",
              borderRadius: "8px",
              border: "1px solid #475569",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              fontSize: "15px",
            }}
          />

          <button
            type="submit"
            style={{
              padding: "13px 20px",
              border: "none",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            + Add Assignment
          </button>
        </form>
      </div>

      <div className="card">
        <h2>My Assignments</h2>

        {assignments.length === 0 ? (
          <p>No assignments yet. Add your first assignment above!</p>
        ) : (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                padding: "16px 0",
                borderBottom: "1px solid #334155",
              }}
            >
              <div style={{ flex: "1", minWidth: "180px" }}>
                <p
                  style={{
                    margin: "0 0 6px",
                    color: assignment.completed ? "#34d399" : "#c4b5fd",
                    textDecoration: assignment.completed
                      ? "line-through"
                      : "none",
                    fontWeight: "bold",
                  }}
                >
                  {assignment.title}
                </p>

                <small
                  style={{
                    color: assignment.completed ? "#34d399" : "#94a3b8",
                  }}
                >
                  {assignment.completed ? "Completed" : "In Progress"}
                </small>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => toggleComplete(assignment.id)}
                  style={{
                    padding: "9px 12px",
                    border: "none",
                    borderRadius: "7px",
                    backgroundColor: assignment.completed
                      ? "#475569"
                      : "#047857",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  {assignment.completed ? "Undo" : "Mark Complete"}
                </button>

                <button
                  type="button"
                  onClick={() => deleteAssignment(assignment.id)}
                  style={{
                    padding: "9px 12px",
                    border: "none",
                    borderRadius: "7px",
                    backgroundColor: "#991b1b",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Dashboard;