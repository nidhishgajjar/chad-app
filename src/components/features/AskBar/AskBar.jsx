import React, { useState, useContext, useEffect } from "react";
import { LangInterfaceContext } from "../../../contexts/langfacecontext";
import { SearchContext } from "../../../contexts/search";
import { EditAppModal } from '../EditAppModal/EditAppModal';
import { SearchInput } from './SearchInput/SearchInput';
import { AppList } from './AppList/AppList';
import { AppWindow } from "../../layout/AppWindow/AppWindow";
import './AskBar.css';

export const AskBar = () => {
  const { 
    langInterfaceVisible, 
    setLangInterfaceVisible, 
    quickSearchVisible, 
    setQuickSearchVisible, 
    changeShortcutVisible 
  } = useContext(LangInterfaceContext);

  const { userInput, handleInput, handleClearClick } = useContext(SearchContext);
  
  const [state, setState] = useState({
    enterUserInput: "",
    googleSearch: "",
    editModalVisible: false,
    activeApp: null,
    tabs: [],
    activeTab: null
  });

  const ipcRenderer = window.electron?.ipcRenderer;

  useEffect(() => {
    if (window.electron) {
      if (!langInterfaceVisible) {
        window.electron.ipcRenderer.send("quickSearchRequested", quickSearchVisible);
      }
      window.electron.ipcRenderer.send("showLangInterface", langInterfaceVisible);
    }
  }, [langInterfaceVisible, quickSearchVisible]);

  const handleEditClick = () => {
    setState(prev => ({ ...prev, editModalVisible: true }));
    setLangInterfaceVisible(false);
    setQuickSearchVisible(false);
    
    if(ipcRenderer) {
      ipcRenderer.send('increase-window-height');
    }
  };

  const handleAppClick = (app) => {
    setState(prev => ({
      ...prev,
      activeApp: app.url,
      tabs: prev.tabs.includes(app.url) ? prev.tabs : [...prev.tabs, app.url],
      activeTab: app.url
    }));
    setQuickSearchVisible(true);
  };

  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      if (!event.getModifierState("Alt") && 
          userInput && 
          !quickSearchVisible && 
          !changeShortcutVisible && 
          !state.editModalVisible) {
        event.preventDefault();
        setQuickSearchVisible(true);
        setState(prev => ({ 
          ...prev, 
          googleSearch: userInput,
          activeTab: `https://www.perplexity.ai/search?q=${encodeURIComponent(userInput)}&focus=internet`
        }));
      } else if (event.getModifierState("Alt") && 
                !event.shiftKey && 
                quickSearchVisible && 
                userInput && 
                !changeShortcutVisible && 
                !state.editModalVisible) {
        event.preventDefault();
        setQuickSearchVisible(true);
        setState(prev => ({ ...prev, enterUserInput: userInput }));
      } else if (event.getModifierState("Alt") && 
                !event.shiftKey && 
                !quickSearchVisible && 
                !changeShortcutVisible && 
                !state.editModalVisible) {
        event.preventDefault();
        handleClearClick();
        setLangInterfaceVisible(true);
        setState(prev => ({ ...prev, enterUserInput: userInput }));
      }
    }
  };

  return (
    <div className="flex flex-col h-screen" onKeyDown={handleKeyDown}>
      {!langInterfaceVisible && !changeShortcutVisible && !quickSearchVisible && !state.editModalVisible && (
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

      {langInterfaceVisible && (
        <LangFace userInput={state.enterUserInput} />
      )}

      {quickSearchVisible && (
        <AppWindow
          googleSearch={state.googleSearch}
          setGoogleSearch={googleSearch => setState(prev => ({ ...prev, googleSearch }))}
          activeApp={state.activeApp}
          tabs={state.tabs}
          setTabs={tabs => setState(prev => ({ ...prev, tabs }))}
          activeTab={state.activeTab}
          setActiveTab={activeTab => setState(prev => ({ ...prev, activeTab }))}
        />
      )}
    </div>
  );
}; 