import React, { useContext, useRef, useEffect, useState } from "react";
import { ViewStateContext } from "../../../contexts/viewstate";
import { SearchContext } from "../../../contexts/search";
import { NavigationBar } from "../../features/Nav/NavigationBar";
import { TabList } from "./TabList";
import { WebViewContainer } from "./WebViewContainer";
import { FIXED_TABS, DEFAULT_PERPLEXITY_URL } from "./constants";
import './BrowserWindow.css';

export const BrowserWindow = ({ 
  activeApp, 
  tabs: initialTabs = [DEFAULT_PERPLEXITY_URL],
  setTabs, 
  activeTab: externalActiveTab,
  setActiveTab: setExternalActiveTab 
}) => {
  const { activeView, setActiveView, setCurrentQuery, currentQuery } = useContext(ViewStateContext);
  const { handleClearClick } = useContext(SearchContext);
  const webviewRefs = useRef({});
  const [readyWebviews, setReadyWebviews] = useState(new Set());
  const pendingSearchRef = useRef(null);

  // Track internal tab state
  const [internalTabs, setInternalTabs] = useState(() => {
    return Array.isArray(initialTabs) ? 
      (initialTabs.includes(DEFAULT_PERPLEXITY_URL) ? initialTabs : [DEFAULT_PERPLEXITY_URL, ...initialTabs]) : 
      [DEFAULT_PERPLEXITY_URL];
  });

  // Track default tab state separately
  const [defaultTabState, setDefaultTabState] = useState({
    url: DEFAULT_PERPLEXITY_URL,
    isReady: false,
    isLoading: false
  });

  // Maintain internal active tab state
  const [activeTab, setInternalActiveTab] = useState(externalActiveTab || DEFAULT_PERPLEXITY_URL);

  // Sync internal and external active tab states
  const setActiveTab = (tab) => {
    setInternalActiveTab(tab);
    setExternalActiveTab(tab);
  };

  // Sync internal tabs with external tabs
  useEffect(() => {
    if (initialTabs && !arraysEqual(initialTabs, internalTabs)) {
      setInternalTabs(
        initialTabs.includes(DEFAULT_PERPLEXITY_URL) ? 
          initialTabs : 
          [DEFAULT_PERPLEXITY_URL, ...initialTabs]
      );
    }
  }, [initialTabs]);

  // Helper function to compare arrays
  const arraysEqual = (a, b) => {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  };

  // Set default tab as active if no tabs or on search
  useEffect(() => {
    if (internalTabs.length === 1 || (activeView === 'browser' && currentQuery)) {
      setActiveTab(DEFAULT_PERPLEXITY_URL);
    }
  }, [internalTabs.length, activeView, currentQuery]);

  // Sync with external active tab changes
  useEffect(() => {
    if (externalActiveTab && externalActiveTab !== activeTab) {
      setInternalActiveTab(externalActiveTab);
    }
  }, [externalActiveTab]);

  // Add error handling for webview loading
  const handleWebViewError = (tabUrl, errorCode, errorDescription) => {
    console.error(`Webview error for ${tabUrl}:`, errorCode, errorDescription);
    if (errorCode === -3 && tabUrl === DEFAULT_PERPLEXITY_URL) {
      const webview = webviewRefs.current[DEFAULT_PERPLEXITY_URL];
      if (webview && !defaultTabState.isLoading) {
        // Retry loading after a short delay
        setTimeout(() => {
          if (pendingSearchRef.current) {
            webview.loadURL(pendingSearchRef.current);
          }
        }, 100);
      }
    }
  };

  const handleWebViewReady = (tabUrl) => {
    setReadyWebviews(prev => {
      const next = new Set(prev);
      next.add(tabUrl);
      return next;
    });

    if (tabUrl === DEFAULT_PERPLEXITY_URL) {
      setDefaultTabState(prev => ({ ...prev, isReady: true, isLoading: false }));
      
      if (pendingSearchRef.current) {
        const webview = webviewRefs.current[DEFAULT_PERPLEXITY_URL];
        if (webview) {
          setDefaultTabState(prev => ({ ...prev, isLoading: true }));
          try {
            webview.loadURL(pendingSearchRef.current);
            pendingSearchRef.current = null;
            setActiveTab(DEFAULT_PERPLEXITY_URL);
          } catch (error) {
            console.error('Error loading URL:', error);
            setDefaultTabState(prev => ({ ...prev, isLoading: false }));
          }
        }
      }
    }
  };

  // Handle Perplexity search with error handling
  useEffect(() => {
    if (activeView === 'browser' && currentQuery) {
      const searchUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent(currentQuery)}&focus=internet`;
      const webview = webviewRefs.current[DEFAULT_PERPLEXITY_URL];

      if (defaultTabState.isReady && webview && !defaultTabState.isLoading) {
        setDefaultTabState(prev => ({ ...prev, isLoading: true }));
        try {
          webview.loadURL(searchUrl);
      setActiveTab(DEFAULT_PERPLEXITY_URL);
        } catch (error) {
          console.error('Error loading search URL:', error);
          setDefaultTabState(prev => ({ ...prev, isLoading: false }));
    }
      } else {
        pendingSearchRef.current = searchUrl;
      }
    }
  }, [activeView, currentQuery, defaultTabState.isReady]);

  // Handle bookmark/app clicks
  useEffect(() => {
    if (activeApp && activeView === 'browser') {
      if (!internalTabs.includes(activeApp)) {
        const defaultTabIndex = internalTabs.indexOf(DEFAULT_PERPLEXITY_URL);
        const newTabs = [...internalTabs];
        newTabs.splice(defaultTabIndex + 1, 0, activeApp);
        setInternalTabs(newTabs);
        setTabs(newTabs);
      }
      setActiveTab(activeApp);
    }
  }, [activeApp, activeView]);

  const handleHomeClick = () => {
    setActiveView('none');
    setCurrentQuery("");
    handleClearClick();
  };

  const handleCloseTab = (tabToClose) => {
    if (tabToClose === DEFAULT_PERPLEXITY_URL) {
      return;
    }

    const closingIndex = internalTabs.indexOf(tabToClose);
    if (closingIndex === -1) return;

    const newTabs = internalTabs.filter(tab => tab !== tabToClose);

    // Update both internal and external tab states
    setInternalTabs(newTabs);
    setTabs(newTabs);

    // Handle active tab changes
    if (activeTab === tabToClose) {
      const newActiveIndex = Math.max(0, closingIndex - 1);
      const newActiveTab = newTabs[newActiveIndex] || DEFAULT_PERPLEXITY_URL;
      setActiveTab(newActiveTab);
    }

    // Clean up webview reference
    if (webviewRefs.current[tabToClose]) {
      delete webviewRefs.current[tabToClose];
    }
  };

  return (
    <div className={`fixed flex flex-col w-full h-full ${activeView !== 'browser' ? 'pointer-events-none opacity-0' : ''}`}>
      <div className="flex flex-col h-full bg-white dark:bg-neutral-900 rounded-lg overflow-hidden shadow-lg transition-all duration-200">
        <NavigationBar
          onHomeClick={handleHomeClick}
        />
        <TabList
          tabs={internalTabs}
          activeTab={activeTab}
          onTabClick={setActiveTab}
          onCloseTab={handleCloseTab}
          fixedTabs={FIXED_TABS}
          setTabs={setInternalTabs}
          webviewRefs={webviewRefs}
        />
        <WebViewContainer
          tabs={internalTabs}
          activeTab={activeTab}
          webviewRefs={webviewRefs}
          onWebViewReady={handleWebViewReady}
          onWebViewError={handleWebViewError}
        />
      </div>
    </div>
  );
}; 