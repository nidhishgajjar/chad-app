import React from 'react';

export const WebViewContainer = ({
  tabs,
  activeTab,
  webviewRefs
}) => {
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
      />
        </div>
      ))}
    </div>
  );
}; 