import { NavLink } from "react-router-dom"; //import "./Navbar.css"; //styles for the navigation bar

function Navbar() { //shared navigation bar component for all pages
  return (
    <header className="site-header">
      <nav className="navbar">
        {/* Link the brand to the Home page.
            The end prop requires the URL to match the path exactly
            for this link to be considered active. */}
        <NavLink to="/" end className="navbar-brand">
        {/* Display </> using HTML entities for the angle brackets. */}
          <span className="navbar-logo">&lt;/&gt;</span>
          <span>CodeCrew</span>
        </NavLink>

        <div className="navbar-links">
           {/* React Router supplies isActive to the className function.
              Add the active class when this link matches the current page. */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Home
          </NavLink>

            {/* Navigate to the Dashboard and highlight its link when active. */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Dashboard
          </NavLink>

            {/* Navigate to the About page and highlight its link when active. */}
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            About
          </NavLink>
        </div>

            {/* Provide a prominent call-to-action link to the Dashboard. */}
        <NavLink to="/dashboard" className="navbar-cta">
          Get Started <span>→</span>
        </NavLink>
      </nav>
    </header>
  );
}

export default Navbar;