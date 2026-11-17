
// import routing components to switch pages
import { BrowserRouter, Routes, Route } from "react-router-dom";

//import navigation bar and page components
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import About from "./pages/About.jsx";

import "./App.css"; //styles for the app

function App() { //main that defines layout and page routes
  return (
    // routing function for components 
    <BrowserRouter> 
      <div className="app">
        <Navbar /> 

        <main> 
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        <footer className="site-footer">
          <span className="footer-logo">&lt;/&gt; CodeCrew</span>
          <span>Built for better teamwork.</span>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;