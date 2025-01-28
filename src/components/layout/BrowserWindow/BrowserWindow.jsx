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
  setActiveTab: setExternalActiveTab,
  setActiveApp
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

  // Sync internal tabs with external tabs but preserve order
  useEffect(() => {
    if (initialTabs && !arraysEqual(initialTabs, internalTabs)) {
      // Get the set of current tabs for comparison
      const currentSet = new Set(internalTabs);
      const newSet = new Set(initialTabs);
      
      // Check if we need to add or remove tabs
      const needsUpdate = 
        // Has new tabs that aren't in current set
        initialTabs.some(tab => !currentSet.has(tab)) ||
        // Has removed tabs that are in current set
        internalTabs.some(tab => !newSet.has(tab) && tab !== DEFAULT_PERPLEXITY_URL);
      
      if (needsUpdate) {
        // Start with current ordered tabs
        const orderedTabs = [...internalTabs];
        
        // Remove tabs that are no longer in initialTabs
        const filteredTabs = orderedTabs.filter(
          tab => tab === DEFAULT_PERPLEXITY_URL || initialTabs.includes(tab)
        );
        
        // Add any new tabs after the default tab
        const defaultTabIndex = filteredTabs.indexOf(DEFAULT_PERPLEXITY_URL);
        initialTabs.forEach(tab => {
          if (!filteredTabs.includes(tab)) {
            filteredTabs.splice(defaultTabIndex + 1, 0, tab);
          }
        });
        
        // Ensure default tab is present
        if (!filteredTabs.includes(DEFAULT_PERPLEXITY_URL)) {
          filteredTabs.unshift(DEFAULT_PERPLEXITY_URL);
        }
        
        setInternalTabs(filteredTabs);
      }
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

  // Handle Perplexity search with error handling
  useEffect(() => {
    if (activeView === 'browser' && currentQuery) {
      const searchUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent(currentQuery)}&focus=internet`;
      const webview = webviewRefs.current[DEFAULT_PERPLEXITY_URL];

      if (webview && readyWebviews.has(DEFAULT_PERPLEXITY_URL)) {
        webview.loadURL(searchUrl);
        setActiveTab(DEFAULT_PERPLEXITY_URL);
      } else {
        // Store the URL to load once webview is ready
        pendingSearchRef.current = searchUrl;
      }
    }
  }, [activeView, currentQuery]);

  const handleHomeClick = () => {
    // Store current tabs and their order before going home
    const currentTabs = [...internalTabs];
    
    // Reset to default tab
    setInternalTabs([DEFAULT_PERPLEXITY_URL]);
    setTabs(currentTabs); // Keep the external tabs state as is
    setActiveTab(DEFAULT_PERPLEXITY_URL);
    
    // Clean up all webview refs except default
    Object.keys(webviewRefs.current).forEach(url => {
      if (url !== DEFAULT_PERPLEXITY_URL) {
        delete webviewRefs.current[url];
      }
    });

    // Don't try to reload the default webview, just reset states
    setDefaultTabState(prev => ({ ...prev, isLoading: false }));
    pendingSearchRef.current = null;
    
    // Reset view state
    setActiveView('none');
    setCurrentQuery("");
    handleClearClick();
  };

  // Remove handleWebViewError since we don't need complex error handling anymore
  const handleWebViewError = (tabUrl, errorCode, errorDescription) => {
    console.error(`Webview error for ${tabUrl}:`, errorCode, errorDescription);
  };

  const handleWebViewReady = (tabUrl) => {
    setReadyWebviews(prev => {
      const next = new Set(prev);
      next.add(tabUrl);
      return next;
    });

    if (tabUrl === DEFAULT_PERPLEXITY_URL) {
      setDefaultTabState(prev => ({ ...prev, isReady: true }));
      
      // Load any pending search when webview becomes ready
      if (pendingSearchRef.current) {
        const webview = webviewRefs.current[DEFAULT_PERPLEXITY_URL];
        if (webview) {
          webview.loadURL(pendingSearchRef.current);
          pendingSearchRef.current = null;
          setActiveTab(DEFAULT_PERPLEXITY_URL);
        }
      }
    }
  };

  // Handle bookmark/app clicks
  useEffect(() => {
    if (activeApp && activeView === 'browser') {
      // Only add the app if we're not coming from a search
      if (!currentQuery && !internalTabs.includes(activeApp)) {
        const defaultTabIndex = internalTabs.indexOf(DEFAULT_PERPLEXITY_URL);
        const newTabs = [...internalTabs];
        newTabs.splice(defaultTabIndex + 1, 0, activeApp);
        setInternalTabs(newTabs);
        setTabs(newTabs);
        setActiveTab(activeApp);
      } else if (currentQuery) {
        // If we're coming from a search, just focus the default tab
        setActiveTab(DEFAULT_PERPLEXITY_URL);
      } else {
        // If the app is already in tabs, just focus it
        setActiveTab(activeApp);
      }
    }
  }, [activeApp, activeView, currentQuery]);

  // Add a cleanup effect for activeApp
  useEffect(() => {
    if (activeView === 'none') {
      // Reset activeApp when going home
      setActiveApp && setActiveApp(null);
    }
  }, [activeView, setActiveApp]);

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
      
      // Always set the active tab first
      setActiveTab(newActiveTab);
      
      // If switching to default tab, store it as pending
      if (newActiveTab === DEFAULT_PERPLEXITY_URL) {
        pendingSearchRef.current = DEFAULT_PERPLEXITY_URL;
      }
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