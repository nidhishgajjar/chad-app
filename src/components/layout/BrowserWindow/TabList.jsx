import React from 'react';
import { motion } from 'framer-motion';
import { DEFAULT_PERPLEXITY_URL } from './constants';

export const TabList = ({
  tabs,
  activeTab,
  onTabClick,
  onCloseTab,
  fixedTabs
}) => {
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

  return (
    <div className="flex items-center px-2 h-10 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-700">
      <div className="flex-1 flex items-center space-x-1 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          const isFixed = fixedTabs?.includes(tab);
          const isPerplexity = tab === DEFAULT_PERPLEXITY_URL;
          const title = getTabTitle(tab);

          return (
            <motion.div
              key={tab}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`
                group flex items-center ${isPerplexity ? 'w-10' : 'min-w-[120px] max-w-[200px]'} h-8 px-3 rounded-lg
                cursor-pointer transition-all duration-200 relative
                ${isActive 
                  ? 'bg-neutral-100 dark:bg-neutral-700' 
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-700/50'}
              `}
              onClick={() => onTabClick(tab)}
            >
              <img 
                src={getFaviconUrl(tab)} 
                alt=""
                className={`w-4 h-4 ${!isPerplexity && 'mr-2'} rounded-sm`}
                onError={(e) => e.target.style.display = 'none'}
              />
              {!isPerplexity && (
                <span className="flex-1 truncate text-sm text-neutral-700 dark:text-neutral-200">
                  {title}
                </span>
              )}
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
                      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
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
    </div>
  );
}; 