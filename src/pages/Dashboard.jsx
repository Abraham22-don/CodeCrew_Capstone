import { useState } from "react"; //import useState to manage project data, search, filters, and form inputs
import { Link } from "react-router-dom"; //import link tfor nav without reload

function Dashboard() { //display project statistics, project cards, and the creation form 
  
  // store project list, 3 examples
  //data held in component memory and resets when component remounts or page reloads, no backend or database yet
  
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

  // store search text and project status filter 
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Projects");

// store current values of the project creation form and whether the form is visible
  const [showForm, setShowForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  // count completed projects from the full list, regardless of search filters. 
  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  //count projects in progress from the full list, regardless of search filters.
  const activeProjects = projects.filter(
    (project) => project.status === "In Progress"
  ).length;

  // filter projects based on search text and status filter
  const filteredProjects = projects.filter((project) => {
    // convert search text to lowercase for case-insensitive comparison
    const searchText = search.toLowerCase();

    //matches if the project name or description includes the search text
    const matchesSearch = 
      project.name.toLowerCase().includes(searchText) ||
      project.description.toLowerCase().includes(searchText);

      //matches if the filter is "All Projects" or the project status matches the selected filter
    const matchesFilter =
      filter === "All Projects" || project.status === filter;

    return matchesSearch && matchesFilter; //display project if it matches both search and filter criteria
  });

  function handleCreateProject(event) { // project form submission handling
    event.preventDefault();

    if (!projectName.trim()) { //reject empty names
      return;
    }

    const newProject = { //create new project with default values and form inputs
      id: Date.now(), // timestamp as unique id
      name: projectName.trim(),

      //use default description if user leaves the field blank 
      description:
        projectDescription.trim() || "No description added yet.",
      category: "New Project",
      progress: 0,
      status: "In Progress",
      color: "purple",
    };

    // use latest state ti create new array containing all projects + new one. avoids changing original array
    setProjects((currentProjects) => [
      ...currentProjects,
      newProject,
    ]);

    //clear form fields and close the form after submission
    setProjectName("");
    setProjectDescription("");
    setShowForm(false);
    //reset search and filter to show all projects after adding a new one
    setFilter("All Projects");
    setSearch("");
  }

  return (
    <div className="dashboard-page">
      {/* header section with title, description, and button to toggle the project creation form */}
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

      {/* button to toggle the project creation form, changes text based on whether the form is visible */}
        <button
          className="dashboard-create-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ New Project"}
        </button>
      </header>

      {/*show statistics about total projects, in progress, and completed */}
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

      {/* render creation form if showForm is true, otherwise hide it */}
      {showForm && (
        <section className="dashboard-form-card">
          <h2>Create a Project</h2>
          <p>Add a new project to your workspace.</p>


        {/* form to create a new project, calls handleCreateProject on submit */}
          <form className="dashboard-form" onSubmit={handleCreateProject}>

            {/* htmlFor connects label to input with matching id, improves accessibility */}
            <label htmlFor="project-name">Project Name</label>
            <input
              id="project-name"
              type="text"
              placeholder="Enter your project name"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              required
            />

        {/* store description changes in state as the user types */}
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
          {/* submit button to create the project, triggers form submission */}
            <button className="dashboard-create-btn" type="submit">
              Create Project →
            </button>
          </form>
        </section>
      )}

          {/* display project nav, search controls, and cards for each project in the filtered list */}
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
          {/* update search as user types */}
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

          {/* update filter state when a status is selected.Without explicit value attributes, options use their text as values. */}
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

        {/*show matching project cartds, or an empty state mnessage if no projects match the search and filter criteria */}
        {filteredProjects.length > 0 ? (
          <div className="dashboard-project-grid">

            {/* convert matching project into cards, key helps react identify each project between renders */}
            {filteredProjects.map((project) => (
              <article className="dashboard-project-card" key={project.id}>
                <div className="project-card-top">
                  <div className={`project-symbol ${project.color}`}>
                    {"</>"}
                  </div>

                {/* select the badge style based on the projects status */}
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

                {/* display project category, name, description, and progress */}
                <span className="project-category">{project.category}</span>
                <h3>{project.name}</h3>
                <p className="project-description">
                  {project.description}
                </p>
                
                {/* display progress bar with accessible attributes for screen readers */}
                <div className="project-progress-heading">
                  <span>Progress</span>
                  <strong>{project.progress}%</strong>
                </div>

                    {/* progress bar with fill color based on project color, width based on progress percentage */}
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
          /* provide feedback and a creation button if no projects match the search and filter criteria */
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
        {/* banner section with a motivational message and link to the About page */}
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

export default Dashboard; //export dashboard so app.jsx can import and render it when the user navigates to /dashboard