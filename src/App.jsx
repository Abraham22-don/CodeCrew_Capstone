import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./ComponentTemp/Navbar.jsx";

import Home from "./PagesTemp/Home.jsx";
import Dashboard from "./PagesTemp/Dashboard.jsx";
import About from "./PagesTemp/About.jsx";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/about"
            element={<About />}
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;