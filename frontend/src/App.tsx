import { BrowserRouter, Routes, Route } from "react-router-dom";
import Menu, { EmptyNomiState } from "./pages/Menu";
import Admin from "./pages/Admin";
import Register from "./pages/Register";
import Platform from "./pages/Platform";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EmptyNomiState />} />
        <Route path="/login" element={<Admin />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/platform" element={<Platform />} />
        <Route path="/:slug" element={<Menu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;