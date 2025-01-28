import React, { useContext } from "react";
import { LangInterfaceContext } from "../../../contexts/langfacecontext";

export const DragArea = () => {
  const { setLangInterfaceVisible, setQuickSearchVisible } = useContext(LangInterfaceContext);

  const handleDragArea = () => {
    setLangInterfaceVisible(false);
    setQuickSearchVisible(false);
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-8 bg-transparent"
      onMouseDown={handleDragArea}
      style={{ WebkitAppRegion: "drag" }}
    />
  );
};

