import React from 'react';
import { FaTimes } from "react-icons/fa";

export const TabList = ({
  tabs,
  activeTab,
  onTabClick,
  onCloseTab,
  fixedTabs
}) => {
  return (
    <div className="flex items-center space-x-4 mb-4">
      {tabs.map((tabUrl) => (
        <div key={tabUrl} className="inline-flex items-center group">
          <button 
            onClick={() => onTabClick(tabUrl)} 
            className={`tab-btn flex items-center space-x-2 px-3 py-2 rounded-lg 
              ${activeTab === tabUrl ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <img 
              src={`https://www.google.com/s2/favicons?sz=16&domain=${tabUrl}`} 
              alt="" 
              className="w-4 h-4"
            />
            <span className="max-w-xs truncate text-sm">
              {new URL(tabUrl).hostname}
            </span>
          </button>
          {!fixedTabs.includes(tabUrl) && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tabUrl);
              }} 
              className="ml-1 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 
                opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaTimes className="w-3 h-3 text-red-500"/>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}; 