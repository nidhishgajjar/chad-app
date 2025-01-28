import React, { useState, createContext, useEffect } from "react";

export const ViewStateContext = createContext();

export const ViewStateProvider = ({ children }) => {
  const [activeView, setActiveView] = useState('none'); // 'none', 'aiAgent', 'browser'
  const [currentQuery, setCurrentQuery] = useState('');

  useEffect(() => {
    if (window.electron) {
      if (activeView === 'browser') {
        window.electron.ipcRenderer.send("browserRequested", true);
      } else if (activeView === 'aiAgent') {
        window.electron.ipcRenderer.send("aiAgentRequested", true);
      } else {
        window.electron.ipcRenderer.send("reset-to-search");
      }
    }
  }, [activeView]);

  const handleKeyCommand = (event, query) => {
    if (event.key === 'Enter') {
      if (event.metaKey) { // Command+Enter
        setActiveView('browser');
        setCurrentQuery(query);
      } else { // Just Enter
        setActiveView('aiAgent');
        setCurrentQuery(query);
      }
    }
  };

  return (
    <ViewStateContext.Provider
      value={{
        activeView,
        setActiveView,
        currentQuery,
        setCurrentQuery,
        handleKeyCommand
      }}>
      {children}
    </ViewStateContext.Provider>
  );
};

export default ViewStateContext;


