import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">
            <span className="badge-dot"></span>
            PROJECT MANAGEMENT MADE SIMPLE
          </span>

          <h1>
            Build Something
            <br />
            <span>Great Together.</span>
          </h1>

          <p className="hero-description">
            Bring your ideas to life with CodeCrew. Organize projects,
            track progress, and keep your team moving toward the same goal.
          </p>

          <div className="hero-buttons">
            <Link to="/dashboard" className="btn btn-primary">
              Explore Dashboard <span>→</span>
            </Link>

            <Link to="/about" className="btn btn-secondary">
              Learn More
            </Link>
          </div>

          <div className="hero-note">
            <span>✓</span> Organize your work.
            <span>✓</span> Track your progress.
          </div>
        </div>

        <div className="hero-visual">
          <div className="glow glow-one"></div>
          <div className="glow glow-two"></div>

          <div className="code-card">
            <div className="code-card-header">
              <div className="window-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span>team-project.jsx</span>
            </div>

            <div className="code-content">
              <p>
                <span className="code-purple">const</span>{" "}
                <span className="code-blue">project</span> = {"{"}
              </p>

              <p className="code-indent">
                <span className="code-orange">name</span>:{" "}
                <span className="code-green">"CodeCrew"</span>,
              </p>

              <p className="code-indent">
                <span className="code-orange">teamwork</span>:{" "}
                <span className="code-purple">true</span>,
              </p>

              <p className="code-indent">
                <span className="code-orange">progress</span>:{" "}
                <span className="code-blue">85</span>
              </p>

              <p>{"};"}</p>

              <br />

              <p>
                <span className="code-purple">function</span>{" "}
                <span className="code-blue">buildTogether</span>() {"{"}
              </p>

              <p className="code-indent">
                <span className="code-purple">return</span>{" "}
                <span className="code-green">"Great things happen."</span>;
              </p>

              <p>{"}"}</p>
            </div>

            <div className="code-card-footer">
              <span className="online-dot"></span>
              Your next idea starts here
            </div>
          </div>

          <div className="floating-card">
            <span className="floating-check">✓</span>

            <div>
              <strong>Project organized</strong>
              <p>Keep everything on track</p>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-heading">
          <span className="section-label">WHAT YOU CAN DO</span>
          <h2>Everything in one workspace.</h2>
          <p>Simple tools to help you stay focused and organized.</p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon icon-purple">▦</div>
            <h3>Stay Organized</h3>
            <p>
              Keep your projects and descriptions together in one convenient
              workspace.
            </p>
            <Link to="/dashboard" className="feature-link">
              View projects →
            </Link>
          </article>

          <article className="feature-card">
            <div className="feature-icon icon-blue">↗</div>
            <h3>Track Progress</h3>
            <p>
              See which projects are in progress and which ones your team has
              completed.
            </p>
            <Link to="/dashboard" className="feature-link">
              Track your work →
            </Link>
          </article>

          <article className="feature-card">
            <div className="feature-icon icon-green">⌘</div>
            <h3>Work Together</h3>
            <p>
              Give your team a shared place to organize ideas and work toward
              common goals.
            </p>
            <Link to="/about" className="feature-link">
              Learn about us →
            </Link>
          </article>
        </div>
      </section>

      <section className="home-cta">
        <div>
          <span className="section-label">READY TO GET STARTED?</span>
          <h2>Your next project starts here.</h2>
          <p>Head to your dashboard and start organizing your work.</p>
        </div>

        <Link to="/dashboard" className="btn btn-primary">
          Open Dashboard →
        </Link>
      </section>
    </div>
  );
}

export default Home;