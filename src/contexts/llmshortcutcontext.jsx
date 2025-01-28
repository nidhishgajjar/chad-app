import React, { useState, createContext } from "react";

export const LLMShortcutContext = createContext();

export const LLMShortcutProvider = ({ children }) => {
  // Navigation states
  const [activeView, setActiveView] = useState('none'); // 'none', 'aiAgent', 'llm', 'browser'
  const [quickSearchVisible, setQuickSearchVisible] = useState(false);
  const [changeShortcutVisible, setChangeShortcutVisible] = useState(false);
  
  // Query states
  const [currentQuery, setCurrentQuery] = useState('');

  const handleKeyCommand = (event, query) => {
    if (event.key === 'Enter') {
      if (event.metaKey) { // Command+Enter
        setActiveView('browser');
        setCurrentQuery(query);
      } else if (event.altKey) { // Option+Enter
        setActiveView('llm');
        setCurrentQuery(query);
      } else { // Just Enter
        setActiveView('aiAgent');
        setCurrentQuery(query);
      }
    }
  };

  return (
    <LLMShortcutContext.Provider
      value={{
        activeView,
        setActiveView,
        quickSearchVisible,
        setQuickSearchVisible,
        changeShortcutVisible,
        setChangeShortcutVisible,
        currentQuery,
        setCurrentQuery,
        handleKeyCommand
      }}>
      {children}
    </LLMShortcutContext.Provider>
  );
};

export default LLMShortcutContext;


