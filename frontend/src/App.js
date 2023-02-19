import "./App.css";
import { Route, Routes } from "react-router-dom";
import Room from "./pages/Room";
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" exact element={<h1>we are at page</h1>} />
        <Route path="/home" exact element={<h1>we are at home page</h1>} />
        <Route path="/room" exact element={<Room />} />
      </Routes>
    </div>
  );
}

export default App;
