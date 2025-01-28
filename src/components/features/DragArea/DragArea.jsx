import React, { useContext } from "react";
import { ViewStateContext } from "../../../contexts/viewstate";

export const DragArea = () => {
  const { setActiveView } = useContext(ViewStateContext);

  const handleDragArea = () => {
    setActiveView('none');
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-8 bg-transparent"
      onMouseDown={handleDragArea}
      style={{ WebkitAppRegion: "drag" }}
    />
  );
};

