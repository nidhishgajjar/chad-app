import React, { useState, useContext, useEffect } from "react";
import { ViewStateContext } from "../../../contexts/viewstate";
import { SearchContext } from "../../../contexts/search";
import { EditAppModal } from '../EditAppModal/EditAppModal';
import { SearchInput } from './SearchInput/SearchInput';
import { AppList } from './AppList/AppList';
import { BrowserWindow } from "../../layout/BrowserWindow/BrowserWindow";
import { DEFAULT_PERPLEXITY_URL } from "../../layout/BrowserWindow/constants";
import './AskBar.css';

export const AskBar = () => {
  const { 
    activeView,
    setActiveView,
    currentQuery,
    handleKeyCommand 
  } = useContext(ViewStateContext);

  const { userInput, handleInput, handleClearClick } = useContext(SearchContext);
  
  const [state, setState] = useState({
    editModalVisible: false,
    activeApp: null,
    tabs: [DEFAULT_PERPLEXITY_URL],
    activeTab: DEFAULT_PERPLEXITY_URL
  });

  const ipcRenderer = window.electron?.ipcRenderer;

  const handleEditClick = () => {
    setState(prev => ({ ...prev, editModalVisible: true }));
    setActiveView('none');
    
    if(ipcRenderer) {
      ipcRenderer.send('increase-window-height');
    }
  };

  const handleAppClick = (app) => {
    setState(prev => {
      const currentTabs = Array.isArray(prev.tabs) ? prev.tabs : [DEFAULT_PERPLEXITY_URL];
      return {
        ...prev,
        activeApp: app.url,
        tabs: currentTabs.includes(app.url) ? currentTabs : [...currentTabs, app.url],
        activeTab: app.url
      };
    });
    setActiveView('browser');
  };

  const handleKeyDown = (event) => {
    handleKeyCommand(event, userInput);
  };

  return (
    <div className="flex flex-col h-screen" onKeyDown={handleKeyDown}>
      {activeView === 'none' && !state.editModalVisible && (
        <>
          <SearchInput 
            value={userInput}
            onChange={handleInput}
            ipcRenderer={ipcRenderer}
          />
          <AppList 
            onAppClick={handleAppClick}
            onEditClick={handleEditClick}
          />
        </>
      )}

      {state.editModalVisible && (
        <EditAppModal 
          visible={state.editModalVisible}
          onClose={() => setState(prev => ({ ...prev, editModalVisible: false }))}
        />
      )}

      {activeView === 'aiAgent' && (
        <div className="flex-1 p-4">
          <h2>AI Agent View</h2>
          <p>Query: {currentQuery}</p>
        </div>
      )}

      {activeView === 'browser' && (
        <BrowserWindow
          activeApp={state.activeApp}
          tabs={state.tabs}
          setTabs={tabs => setState(prev => ({ ...prev, tabs: Array.isArray(tabs) ? tabs : [DEFAULT_PERPLEXITY_URL] }))}
          activeTab={state.activeTab}
          setActiveTab={activeTab => setState(prev => ({ ...prev, activeTab }))}
        />
      )}
    </div>
  );
}; 