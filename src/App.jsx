import React, { useEffect } from "react";
import { renderScene } from "./scenes/scene3/index";
import "./App.css";

const App = () => {
  useEffect(() => {
    renderScene(graphContainer.current);
  }, []);
  const graphContainer = React.useRef(null);
  return (
    <div
      ref={graphContainer}
      id="graph"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        // border: "1px solid red",
        // width: "500px",
        // height: "300px",
      }}
    ></div>
  );
};

export default App;
