import { BrowserRouter, Routes, Route } from "react-router-dom";
import Menu from "./pages/Menu";
import Admin from "./pages/Admin";
import Register from "./pages/Register";
import Platform from "./pages/Platform";
import PasswordRecovery from "./pages/PasswordRecovery";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Admin />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/platform" element={<Platform />} />
        <Route path="/password-recovery" element={<PasswordRecovery />} />
        <Route path="/:slug" element={<Menu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;