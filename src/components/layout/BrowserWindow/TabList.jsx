import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_PERPLEXITY_URL } from './constants';

export const TabList = ({
  tabs,
  activeTab,
  onTabClick,
  onCloseTab,
  fixedTabs,
  setTabs,
  webviewRefs
}) => {
  const scrollContainerRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [tabEngagement, setTabEngagement] = useState({});
  const engagementTimerRef = useRef(null);
  const reorderTimeoutRef = useRef(null);

  const getFaviconUrl = (url) => {
    return `https://www.google.com/s2/favicons?sz=32&domain=${url}`;
  };

  const getTabTitle = (url) => {
    try {
      if (url === DEFAULT_PERPLEXITY_URL) {
        return '';
      }
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return url;
    }
  };

  const checkForOverflow = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const hasOverflow = container.scrollWidth > container.clientWidth;
      setIsOverflowing(hasOverflow);
      updateScrollButtons();
    }
  };

  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftScroll(container.scrollLeft > 0);
      setShowRightScroll(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  useEffect(() => {
    checkForOverflow();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons);
      window.addEventListener('resize', checkForOverflow);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', checkForOverflow);
      }
    };
  }, [tabs]);

  const startScrolling = (direction) => {
    // Clear any existing interval first
    stopScrolling();

    // Set up continuous scrolling
    scrollIntervalRef.current = setInterval(() => {
      const container = scrollContainerRef.current;
      if (container) {
        const scrollAmount = direction === 'left' ? -20 : 20;
        container.scrollBy({
          left: scrollAmount,
          behavior: 'auto'
        });

        // Update scroll buttons visibility
        updateScrollButtons();
      }
    }, 50);
  };

  const stopScrolling = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  // Clean up interval on unmount and when tabs change
  useEffect(() => {
    return () => stopScrolling();
  }, [tabs]);

  // Ensure active tab is visible
  useEffect(() => {
    const container = scrollContainerRef.current;
    const activeTabElement = container?.querySelector(`[data-tab="${activeTab}"]`);
    
    if (container && activeTabElement) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();
      
      if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
        activeTabElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeTab]);

  // Track tab engagement
  useEffect(() => {
    if (activeTab === DEFAULT_PERPLEXITY_URL) return;

    // Clear any existing timers
    if (engagementTimerRef.current) {
      clearTimeout(engagementTimerRef.current);
    }
    if (reorderTimeoutRef.current) {
      clearTimeout(reorderTimeoutRef.current);
    }

    // Start engagement timer for the active tab
    engagementTimerRef.current = setTimeout(() => {
      console.log(`⏰ Tab reordered: User spent 5 seconds on ${getTabTitle(activeTab) || activeTab}`);
      reorderTabs(activeTab);
    }, 5000); // 5 seconds threshold

    return () => {
      if (engagementTimerRef.current) {
        clearTimeout(engagementTimerRef.current);
      }
      if (reorderTimeoutRef.current) {
        clearTimeout(reorderTimeoutRef.current);
      }
    };
  }, [activeTab]);

  const reorderTabs = useCallback((engagedTab) => {
    if (engagedTab === DEFAULT_PERPLEXITY_URL) return;

    setTabs(prevTabs => {
      const newTabs = [...prevTabs];
      const defaultTabIndex = newTabs.indexOf(DEFAULT_PERPLEXITY_URL);
      const engagedTabIndex = newTabs.indexOf(engagedTab);
      
      // Log the reordering details
      console.log('📊 Tab Reorder Details:', {
        tab: getTabTitle(engagedTab) || engagedTab,
        movedFrom: engagedTabIndex,
        movedTo: defaultTabIndex + 1,
        totalTabs: newTabs.length
      });
      
      // Remove the engaged tab
      newTabs.splice(engagedTabIndex, 1);
      
      // Insert it after the default tab
      newTabs.splice(defaultTabIndex + 1, 0, engagedTab);
      
      // Auto scroll to start after reordering
      setTimeout(() => {
        const container = scrollContainerRef.current;
        if (container) {
          container.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        }
      }, 100);
      
      return newTabs;
    });
  }, [setTabs]);

  // Enhanced tab click handler - now just handles the tab switch
  const handleTabClick = (tab) => {
    onTabClick(tab);
  };

  // Ensure we stop scrolling when mouse leaves the tab list area
  const handleTabListMouseLeave = () => {
    stopScrolling();
  };

  // Navigation handlers
  const handleBack = () => {
    console.log('🔄 Attempting to go back');
    const webview = webviewRefs.current[activeTab];
    if (webview && webview.canGoBack()) {
      console.log('✅ Going back');
      webview.goBack();
    } else {
      console.log('❌ Cannot go back');
    }
  };

  const handleForward = () => {
    console.log('🔄 Attempting to go forward');
    const webview = webviewRefs.current[activeTab];
    if (webview && webview.canGoForward()) {
      console.log('✅ Going forward');
      webview.goForward();
    } else {
      console.log('❌ Cannot go forward');
    }
  };

  const handleReload = () => {
    const webview = webviewRefs.current[activeTab];
    if (webview) {
      webview.reload();
    }
  };

  // Handle swipe gestures through IPC
  useEffect(() => {
    console.log('🔍 Setting up swipe gesture handler for tab:', activeTab);
    const webview = webviewRefs.current[activeTab];
    
    if (webview) {
      console.log('✅ Found webview for tab:', activeTab);
      
      const handleSwipe = (direction) => {
        console.log('🔄 Received swipe event:', direction);
        console.log('Current webview state:', {
          canGoBack: webview.canGoBack?.(),
          canGoForward: webview.canGoForward?.(),
          ready: !!webview.getWebContentsId
        });

        if (direction === 'right') {
          handleBack();
        } else if (direction === 'left') {
          handleForward();
        }
      };

      console.log('🔄 Registering swipe event handler');
      const cleanup = window.electron?.ipcRenderer?.on('swipe', handleSwipe);

      return () => {
        console.log('🧹 Cleaning up swipe handler for tab:', activeTab);
        if (cleanup) cleanup();
      };
    } else {
      console.log('❌ No webview found for tab:', activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    console.log('Setting up navigation handlers');
    const webview = webviewRefs.current[activeTab];
    
    if (webview) {
      // Wait for webview to be ready
      const handleDomReady = () => {
        console.log('Webview ready:', {
          canGoBack: webview.canGoBack(),
          canGoForward: webview.canGoForward()
        });

        // Log navigation state changes
        webview.addEventListener('did-navigate', () => {
          console.log('Navigation state:', {
            canGoBack: webview.canGoBack(),
            canGoForward: webview.canGoForward()
          });
        });
      };

      webview.addEventListener('dom-ready', handleDomReady);
      
      return () => {
        webview.removeEventListener('dom-ready', handleDomReady);
      };
    }
  }, [activeTab]);

    return (
    <div 
      className="flex items-center h-10 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-700"
      onMouseLeave={handleTabListMouseLeave}
    >
         

<motion.div
  data-tab={DEFAULT_PERPLEXITY_URL}
  layout
  className={`
    group flex items-center w-10 h-8 px-3 mx-2 rounded-lg flex-shrink-0
    cursor-pointer transition-all duration-200 relative
    ${activeTab === DEFAULT_PERPLEXITY_URL 
      ? 'bg-neutral-100 dark:bg-neutral-700 shadow-sm' 
      : 'hover:bg-neutral-100 dark:hover:bg-neutral-700/50'}
  `}
  onClick={() => handleTabClick(DEFAULT_PERPLEXITY_URL)}
>
  <img 
    src={getFaviconUrl(DEFAULT_PERPLEXITY_URL)} 
    alt="Perplexity"
    className="w-4 h-4 rounded-sm"
    onError={(e) => e.target.style.display = 'none'}
  />
  {activeTab === DEFAULT_PERPLEXITY_URL && (
    <motion.div
      layoutId="activeTab"
      className="absolute inset-0 bg-neutral-200 dark:bg-neutral-600 rounded-lg -z-10"
      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
    />
  )}
</motion.div>

<div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-2" />

{/* Navigation Controls */}
<div className="flex items-center space-x-2">
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={handleBack}
    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors"
  >
    <svg className="w-4 h-4 text-neutral-600 dark:text-neutral-300" viewBox="0 0 24 24">
      <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
    </svg>
  </motion.button>

  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={handleForward}
    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors"
  >
    <svg className="w-4 h-4 text-neutral-600 dark:text-neutral-300" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
    </svg>
  </motion.button>

  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={handleReload}
    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors"
  >
    <svg className="w-4 h-4 text-neutral-600 dark:text-neutral-300" viewBox="0 0 24 24">
      <path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
    </svg>
  </motion.button>
</div>

<div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-2" />

      <div 
        className="w-5 h-8 flex-shrink-0 relative"
        onMouseLeave={stopScrolling}
      >
        <AnimatePresence>
          {showLeftScroll && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseEnter={() => startScrolling('left')}
              onMouseLeave={stopScrolling}
              className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80 dark:bg-neutral-700/80 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" viewBox="0 0 24 24">
                <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex-1 flex items-center space-x-1 overflow-x-auto scrollbar-none scroll-smooth px-1"
        onScroll={updateScrollButtons}
        onMouseEnter={stopScrolling}
      >
        {tabs.filter(tab => tab !== DEFAULT_PERPLEXITY_URL).map((tab) => {
          const isActive = tab === activeTab;
          const isFixed = fixedTabs?.includes(tab);
          const title = getTabTitle(tab);

  return (
            <motion.div
              key={tab}
              data-tab={tab}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`
                group flex items-center min-w-[120px] max-w-[200px] h-8 px-3 rounded-lg
                cursor-pointer transition-all duration-200 relative flex-shrink-0
                ${isActive 
                  ? 'bg-neutral-100 dark:bg-neutral-700 shadow-sm' 
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-700/50'}
              `}
              onClick={() => handleTabClick(tab)}
            >
              <img 
                src={getFaviconUrl(tab)} 
                alt=""
                className="w-4 h-4 mr-2 rounded-sm"
                onError={(e) => e.target.style.display = 'none'}
              />
              <span className="flex-1 truncate text-sm text-neutral-700 dark:text-neutral-200">
                {title}
              </span>
              {!isFixed && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                    onCloseTab(tab);
                  }}
                  className={`
                    ml-2 p-1 rounded-full opacity-0 group-hover:opacity-100
                    hover:bg-neutral-200 dark:hover:bg-neutral-600
                    transition-opacity duration-200
                  `}
                >
                  <svg className="w-3 h-3 text-neutral-500 dark:text-neutral-400" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 17.59 13.41 12z"
                    />
                  </svg>
            </button>
          )}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-neutral-200 dark:bg-neutral-600 rounded-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <div 
        className="w-5 h-8 flex-shrink-0 relative"
        onMouseLeave={stopScrolling}
      >
        <AnimatePresence>
          {showRightScroll && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseEnter={() => startScrolling('right')}
              onMouseLeave={stopScrolling}
              className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80 dark:bg-neutral-700/80 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" viewBox="0 0 24 24">
                <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {isOverflowing && (
        <div className="flex items-center ml-2 pl-2 border-l border-neutral-200 dark:border-neutral-700">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-2 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors text-xs text-neutral-600 dark:text-neutral-300 ml-2 mr-4"
          >
            <span>{tabs.filter(tab => tab !== DEFAULT_PERPLEXITY_URL).length} tabs</span>
          </motion.button>
        </div>
      )}
    </div>
  );
}; 