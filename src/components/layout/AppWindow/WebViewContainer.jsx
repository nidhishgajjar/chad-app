import React, { useEffect } from 'react';

export const WebViewContainer = ({
  tabs,
  activeTab,
  webviewRefs,
  onWebViewReady
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

      const webview = webviewRefs.current[tabUrl];
      if (webview) {
        webview.addEventListener('dom-ready', handleDomReady);
        cleanup[tabUrl] = handleDomReady;
      }
    });

    // Cleanup event listeners
    return () => {
      Object.entries(cleanup).forEach(([tabUrl, handler]) => {
        const webview = webviewRefs.current[tabUrl];
        if (webview) {
          webview.removeEventListener('dom-ready', handler);
        }
      });
    };
  }, [tabs]);

  return (
    <div className="flex-grow relative rounded-lg overflow-hidden">
      {tabs.map((tabUrl) => (
        <div 
          key={tabUrl} 
          className={`absolute inset-0 w-full h-full ${activeTab === tabUrl ? 'block' : 'hidden'} rounded-lg overflow-hidden`}
        >
          <webview
            ref={el => webviewRefs.current[tabUrl] = el}
            src={tabUrl}
            className="w-full h-full"
            allowpopups="true"
            webpreferences="contextIsolation=yes, nodeIntegration=no"
            partition="persist:main"
            httpreferrer="https://www.perplexity.ai"
          />
        </div>
      ))}
    </div>
  );
}; 