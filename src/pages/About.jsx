import { Link } from "react-router-dom";

function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <span className="section-label">ABOUT CODECREW</span>

        <h1>
          Better projects.
          <br />
          <span>Stronger teamwork.</span>
        </h1>

        <p>
          CodeCrew gives teams a simple place to organize projects,
          track progress, and turn ideas into results.
        </p>

        <Link to="/dashboard" className="btn btn-primary">
          Explore Dashboard →
        </Link>
      </section>

      <section className="about-content">
        <article className="about-card">
          <div className="feature-icon icon-purple">◎</div>
          <h2>Our Mission</h2>
          <p>
            Make project organization simple and accessible so teams
            can spend more time working toward their goals.
          </p>
        </article>

        <article className="about-card">
          <div className="feature-icon icon-blue">⌘</div>
          <h2>Our Approach</h2>
          <p>
            Keep project information in one workspace with tools
            for searching, organizing, and checking progress.
          </p>
        </article>

        <article className="about-card">
          <div className="feature-icon icon-green">↗</div>
          <h2>Our Vision</h2>
          <p>
            Create a useful workspace for school assignments,
            personal projects, and collaborative ideas.
          </p>
        </article>
      </section>

      <section className="about-highlight">
        <div>
          <span className="section-label">START BUILDING</span>
          <h2>One workspace. Clear goals. Better progress.</h2>
          <p>Bring your projects together and see what comes next.</p>
        </div>

        <Link to="/dashboard" className="btn btn-primary">
          Get Started →
        </Link>
      </section>
    </div>
  );
}

export default About;