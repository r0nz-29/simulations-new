import React, { useEffect } from "react";
import { renderScene } from "./scenes/scene5/index";
import "./App.css";

const App = () => {
  useEffect(() => {
    renderScene();
  }, []);
  return (
    <button
      style={{
        position: "absolute",
        top: "100px",
        right: "10px",
        width: "13vw",
        padding: "1vw",
        fontSize: "22px",
        cursor: "pointer",
        backgroundColor: "#a9a9a9",
        borderRadius: "5px",
        border: "none",
      }}
      onClick={() => window.location.reload()}
    >
      reset
    </button>
  );
};

export default App;
