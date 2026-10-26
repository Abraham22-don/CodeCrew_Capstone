import { useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "CodeCrew Website",
      description: "Build and improve the CodeCrew capstone website.",
      category: "Web Development",
      progress: 75,
      status: "In Progress",
      color: "purple",
    },
    {
      id: 2,
      name: "UI Design System",
      description: "Create a consistent design for the application.",
      category: "UI/UX Design",
      progress: 45,
      status: "In Progress",
      color: "blue",
    },
    {
      id: 3,
      name: "Project Planning",
      description: "Organize requirements and finalize project goals.",
      category: "Planning",
      progress: 100,
      status: "Completed",
      color: "green",
    },
  ]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Projects");
  const [showForm, setShowForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  const activeProjects = projects.filter(
    (project) => project.status === "In Progress"
  ).length;

  const filteredProjects = projects.filter((project) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      project.name.toLowerCase().includes(searchText) ||
      project.description.toLowerCase().includes(searchText);

    const matchesFilter =
      filter === "All Projects" || project.status === filter;

    return matchesSearch && matchesFilter;
  });

  function handleCreateProject(event) {
    event.preventDefault();

    if (!projectName.trim()) {
      return;
    }

    const newProject = {
      id: Date.now(),
      name: projectName.trim(),
      description:
        projectDescription.trim() || "No description added yet.",
      category: "New Project",
      progress: 0,
      status: "In Progress",
      color: "purple",
    };

    setProjects((currentProjects) => [
      ...currentProjects,
      newProject,
    ]);

    setProjectName("");
    setProjectDescription("");
    setShowForm(false);
    setFilter("All Projects");
    setSearch("");
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            WORKSPACE / OVERVIEW
          </span>
          <h1>
            Your Dashboard<span className="heading-period">.</span>
          </h1>
          <p>Welcome back! Here's what's happening with your projects.</p>
        </div>

        <button
          className="dashboard-create-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ New Project"}
        </button>
      </header>

      <section className="dashboard-stats">
        <article className="stat-card">
          <div className="stat-card-top">
            <span>Total Projects</span>
            <span className="stat-icon stat-purple">▦</span>
          </div>
          <h2>{projects.length}</h2>
          <p>Projects in your workspace</p>
        </article>

        <article className="stat-card">
          <div className="stat-card-top">
            <span>In Progress</span>
            <span className="stat-icon stat-blue">◷</span>
          </div>
          <h2>{activeProjects}</h2>
          <p>Projects currently active</p>
        </article>

        <article className="stat-card">
          <div className="stat-card-top">
            <span>Completed</span>
            <span className="stat-icon stat-green">✓</span>
          </div>
          <h2>{completedProjects}</h2>
          <p>Projects finished successfully</p>
        </article>
      </section>

      {showForm && (
        <section className="dashboard-form-card">
          <h2>Create a Project</h2>
          <p>Add a new project to your workspace.</p>

          <form className="dashboard-form" onSubmit={handleCreateProject}>
            <label htmlFor="project-name">Project Name</label>
            <input
              id="project-name"
              type="text"
              placeholder="Enter your project name"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              required
            />

            <label htmlFor="project-description">Description</label>
            <textarea
              id="project-description"
              placeholder="What is this project about?"
              value={projectDescription}
              onChange={(event) =>
                setProjectDescription(event.target.value)
              }
              rows="3"
            />

            <button className="dashboard-create-btn" type="submit">
              Create Project →
            </button>
          </form>
        </section>
      )}

      <section className="dashboard-projects">
        <div className="dashboard-section-heading">
          <div>
            <span className="dashboard-eyebrow">YOUR WORKSPACE</span>
            <h2>Recent Projects</h2>
            <p>Keep track of your team's latest work.</p>
          </div>

          <Link to="/" className="dashboard-back-link">
            ← Back Home
          </Link>
        </div>

        <div className="dashboard-toolbar">
          <div className="dashboard-search">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search projects..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search projects"
            />
          </div>

          <select
            className="dashboard-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter projects by status"
          >
            <option>All Projects</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="dashboard-project-grid">
            {filteredProjects.map((project) => (
              <article className="dashboard-project-card" key={project.id}>
                <div className="project-card-top">
                  <div className={`project-symbol ${project.color}`}>
                    {"</>"}
                  </div>

                  <span
                    className={`project-status ${
                      project.status === "Completed"
                        ? "status-completed"
                        : "status-progress"
                    }`}
                  >
                    <span className="project-status-dot"></span>
                    {project.status}
                  </span>
                </div>

                <span className="project-category">{project.category}</span>
                <h3>{project.name}</h3>
                <p className="project-description">
                  {project.description}
                </p>

                <div className="project-progress-heading">
                  <span>Progress</span>
                  <strong>{project.progress}%</strong>
                </div>

                <div
                  className="project-progress-track"
                  role="progressbar"
                  aria-label={`${project.name} progress`}
                  aria-valuenow={project.progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div
                    className={`project-progress-fill ${project.color}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>

                <div className="project-card-footer">
                  <span>
                    {project.status === "Completed"
                      ? "All finished!"
                      : "Keep up the progress"}
                  </span>
                  <span className="project-arrow">↗</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty">
            <div className="empty-icon">⌕</div>
            <h3>No projects found</h3>
            <p>Try another search or create a new project.</p>
            <button
              className="dashboard-create-btn"
              onClick={() => setShowForm(true)}
            >
              + Create Project
            </button>
          </div>
        )}
      </section>

      <section className="dashboard-banner">
        <div className="banner-icon">✦</div>
        <div>
          <h3>Great things happen when we work together.</h3>
          <p>Keep building, collaborating, and making progress.</p>
        </div>
        <Link to="/about" className="banner-link">
          About CodeCrew →
        </Link>
      </section>
    </div>
  );
}

export default Dashboard;