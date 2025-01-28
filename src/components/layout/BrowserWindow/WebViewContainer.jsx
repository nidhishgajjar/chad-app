import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const WebViewContainer = ({
  tabs,
  activeTab,
  webviewRefs,
  onWebViewReady,
  onWebViewError
}) => {
  const mountedRef = useRef(new Set());

  useEffect(() => {
    // Cleanup function to remove event listeners
    const cleanup = {};

    tabs.forEach(tabUrl => {
      const handleDomReady = () => {
        if (onWebViewReady) {
          onWebViewReady(tabUrl);
        }
        mountedRef.current.add(tabUrl);
      };

      const handleLoadAbort = (event, errorCode, errorDescription) => {
        if (onWebViewError) {
          onWebViewError(tabUrl, errorCode, errorDescription);
        }
      };

      const webview = webviewRefs.current[tabUrl];
      if (webview && !mountedRef.current.has(tabUrl)) {
        webview.addEventListener('dom-ready', handleDomReady);
        webview.addEventListener('did-fail-load', handleLoadAbort);
        cleanup[tabUrl] = {
          domReady: handleDomReady,
          loadAbort: handleLoadAbort
        };
      }
    });

    // Cleanup event listeners
    return () => {
      Object.entries(cleanup).forEach(([tabUrl, handlers]) => {
        const webview = webviewRefs.current[tabUrl];
        if (webview) {
          webview.removeEventListener('dom-ready', handlers.domReady);
          webview.removeEventListener('did-fail-load', handlers.loadAbort);
        }
      });
    };
  }, [tabs]);

  return (
    <div className="flex-grow relative">
      <AnimatePresence mode="wait">
        {tabs.map((tabUrl) => {
          const isMounted = mountedRef.current.has(tabUrl);
          return (
            <motion.div
              key={tabUrl}
              initial={false}
              animate={{ 
                opacity: activeTab === tabUrl ? 1 : 0,
                scale: activeTab === tabUrl ? 1 : 0.98
              }}
              transition={{ duration: 0.2 }}
              className={`absolute inset-0 ${activeTab === tabUrl ? 'pointer-events-auto' : 'pointer-events-none'}`}
              style={{ 
                zIndex: activeTab === tabUrl ? 1 : 0,
                visibility: activeTab === tabUrl ? 'visible' : 'hidden'
              }}
            >
              <webview
                ref={el => {
                  if (el && !webviewRefs.current[tabUrl]) {
                    webviewRefs.current[tabUrl] = el;
                    // Add event listeners immediately after ref is set
                    el.addEventListener('dom-ready', () => {
                      if (onWebViewReady) {
                        onWebViewReady(tabUrl);
                      }
                      mountedRef.current.add(tabUrl);
                    });
                    el.addEventListener('did-fail-load', (event, errorCode, errorDescription) => {
                      if (onWebViewError) {
                        onWebViewError(tabUrl, errorCode, errorDescription);
                      }
                    });
                  }
                }}
                src={tabUrl}
                className="w-full h-full bg-white dark:bg-neutral-900"
                allowpopups="true"
                webpreferences="contextIsolation=yes, nodeIntegration=no"
                partition="persist:main"
                httpreferrer="https://www.perplexity.ai"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};