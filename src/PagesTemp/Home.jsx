function Home() {
  return (
    <section className="page">
      <p style={{ color: "#60a5fa", fontWeight: "bold" }}>
        CODECREW • CAPSTONE PROJECT
      </p>

      <h1>Welcome to CodeCrew!</h1>

      <p className="subtitle">
        A smarter way to organize college life.
        Stay focused, organized, and ahead.
      </p>

      <div className="card">
        <h2>Student Productivity Hub</h2>

        <p>
          College can get busy. Our goal is to help students
          manage assignments, keep track of deadlines, and
          monitor academic progress in one convenient place.
        </p>

        <p>
          <strong style={{ color: "#c084fc" }}>
            Our mission:
          </strong>{" "}
          Make student life easier, one assignment at a time.
        </p>
      </div>

      <div className="card">
        <h2>What We're Building</h2>

        <p style={{ color: "#60a5fa" }}>
          Assignment tracking and organization
        </p>

        <p style={{ color: "#c084fc" }}>
          Deadline management
        </p>

        <p style={{ color: "#34d399" }}>
          Academic progress tracking
        </p>
      </div>
    </section>
  );
}

export default Home;