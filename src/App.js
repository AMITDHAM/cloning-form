// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CloneDealForm from "./components/CloneForm";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CloneDealForm />} />
      </Routes>
    </Router>
  );
}

export default App;
