import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const WebViewContainer = ({
  tabs,
  activeTab,
  webviewRefs,
  onWebViewReady,
  onWebViewError
}) => {
  useEffect(() => {
    // Cleanup function to remove event listeners
    const cleanup = {};

    tabs.forEach(tabUrl => {
      const handleDomReady = () => {
        if (onWebViewReady) {
          onWebViewReady(tabUrl);
        }
      };

      const handleLoadAbort = (event, errorCode, errorDescription) => {
        if (onWebViewError) {
          onWebViewError(tabUrl, errorCode, errorDescription);
        }
      };

      const webview = webviewRefs.current[tabUrl];
      if (webview) {
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
        {tabs.map((tabUrl) => (
          <motion.div
            key={tabUrl}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: activeTab === tabUrl ? 1 : 0,
              scale: activeTab === tabUrl ? 1 : 0.98
            }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`absolute inset-0 ${activeTab === tabUrl ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{ zIndex: activeTab === tabUrl ? 1 : 0 }}
          >
            <webview
              ref={el => webviewRefs.current[tabUrl] = el}
              src={tabUrl}
              className="w-full h-full bg-white dark:bg-neutral-900"
              allowpopups="true"
              webpreferences="contextIsolation=yes, nodeIntegration=no"
              partition="persist:main"
              httpreferrer="https://www.perplexity.ai"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};