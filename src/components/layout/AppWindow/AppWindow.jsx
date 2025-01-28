import React, { useContext, useRef, useState, useEffect } from "react";
import { LangInterfaceContext } from "../../../contexts/langfacecontext";
import { SearchContext } from "../../../contexts/search";
import { NavigationBar } from "./NavigationBar";
import { TabList } from "./TabList";
import { WebViewContainer } from "./WebViewContainer";
import { FIXED_TABS } from "./constants";

export const AppWindow = ({ 
  googleSearch, 
  setGoogleSearch, 
  activeApp, 
  tabs, 
  setTabs, 
  activeTab, 
  setActiveTab 
}) => {
  const { changeShortcutVisible, quickSearchVisible, setQuickSearchVisible } = useContext(LangInterfaceContext);
  const { handleClearClick } = useContext(SearchContext);
  const webviewRefs = useRef({});
  const [closedTabs, setClosedTabs] = useState([]);

  useEffect(() => {
    const updatedTabs = tabs.map(tab => {
      if (tab.startsWith('https://www.perplexity.ai/search?q=')) {
        return `https://www.perplexity.ai/search?q=${encodeURIComponent(googleSearch)}&focus=internet`;
      }
      return tab;
    });

    FIXED_TABS.forEach(tab => {
      if (!updatedTabs.includes(tab)) {
        updatedTabs.push(tab);
      }
    });

    if (JSON.stringify(updatedTabs) !== JSON.stringify(tabs)) {
      setTabs(updatedTabs);
    }
  }, [googleSearch, tabs]);

  useEffect(() => {
    const currentWebview = webviewRefs.current[activeTab];
    if (currentWebview) {
      currentWebview.addEventListener('did-navigate', (e) => {
        // Update the favicon if needed
        const newTabUrl = e.url;
        const faviconUrl = `https://www.google.com/s2/favicons?sz=16&domain=${newTabUrl}`;
      });
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeApp && !tabs.includes(activeApp) && closedTabs.includes(activeApp)) {
      setTabs(prevTabs => [...prevTabs, activeApp]);
      setActiveTab(activeApp);
    }
  }, [activeApp, tabs, closedTabs]);

  const handleHomeClick = () => {
    setQuickSearchVisible(false);
    setGoogleSearch("");
    handleClearClick();
  };

  const handleNavigation = {
    back: () => {
      const currentWebview = webviewRefs.current[activeTab];
      if (currentWebview?.canGoBack()) {
        currentWebview.goBack();
      }
    },
    forward: () => {
      const currentWebview = webviewRefs.current[activeTab];
      if (currentWebview?.canGoForward()) {
        currentWebview.goForward();
      }
    },
    reload: () => {
      const currentWebview = webviewRefs.current[activeTab];
      if (currentWebview) {
        currentWebview.reload();
      }
    }
  };

  const handleCloseTab = (tabToClose) => {
    if (FIXED_TABS.includes(tabToClose)) {
      return;
    }

    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab !== tabToClose);
      if (activeTab === tabToClose && newTabs.length > 0) {
        setActiveTab(newTabs[0]);
      }
      return newTabs;
    });
  };

  return (
    <div className="fixed flex flex-col w-full h-full p-5 md:px-5 py-5">
      {quickSearchVisible && !changeShortcutVisible && (
        <div className="flex flex-col h-full">
          <NavigationBar
            onHomeClick={handleHomeClick}
            onBackClick={handleNavigation.back}
            onForwardClick={handleNavigation.forward}
            onReloadClick={handleNavigation.reload}
          />
          <TabList
            tabs={tabs}
            activeTab={activeTab}
            onTabClick={setActiveTab}
            onCloseTab={handleCloseTab}
            fixedTabs={FIXED_TABS}
          />
          <WebViewContainer
            tabs={tabs}
            activeTab={activeTab}
            webviewRefs={webviewRefs}
          />
        </div>
      )}
    </div>
  );
}; 