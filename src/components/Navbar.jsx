import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="site-header">
      <nav className="navbar">
        <NavLink to="/" end className="navbar-brand">
          <span className="navbar-logo">&lt;/&gt;</span>
          <span>CodeCrew</span>
        </NavLink>

        <div className="navbar-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            About
          </NavLink>
        </div>

        <NavLink to="/dashboard" className="navbar-cta">
          Get Started <span>→</span>
        </NavLink>
      </nav>
    </header>
  );
}

export default Navbar;