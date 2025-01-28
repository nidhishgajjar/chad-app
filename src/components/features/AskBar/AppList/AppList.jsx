import React, { useState, useEffect } from 'react';
import { DEFAULT_APPS } from './constants';

export const AppList = ({ onAppClick, onEditClick }) => {
  const [apps, setApps] = useState(() => {
    const localData = localStorage.getItem('apps');
    return localData ? JSON.parse(localData) : DEFAULT_APPS;
  });

  const [loadedApps, setLoadedApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState({});

  useEffect(() => {
    const filteredApps = apps.filter(app => app.url && app.url.trim() !== '');
    localStorage.setItem('apps', JSON.stringify(filteredApps));
  }, [apps]);

  useEffect(() => {
    const loadApps = async () => {
      const newApps = await Promise.all(apps.map(async (app) => {
        const favicon = `https://www.google.com/s2/favicons?sz=32&domain=${app.url}`;
        return { ...app, image: favicon };
      }));
      setLoadedApps(newApps);
      setLoading(false);
    };

    loadApps();
  }, [apps]);

  if (loading) {
    return <div className="mt-16 px-1">Loading...</div>;
  }

  return (
    <div className="custom-scrollbar flex overflow-x-scroll mt-16 px-1 whitespace-nowrap">
      {loadedApps
        .filter(app => app.url.trim() !== '')
        .map((app, index) => (
          <button
            key={index}
            onClick={() => onAppClick(app)}
            className="flex items-center justify-center w-12 h-12 mx-4 rounded-full 
              bg-neutral-200 dark:bg-neutral-600 text-white flex-shrink-0"
          >
            {!failedImages[app.url] && app.image ? (
              <img
                src={app.image}
                alt={app.name || 'App icon'}
                style={{ borderRadius: '5px' }}
                onError={() => {
                  setFailedImages(prev => ({
                    ...prev,
                    [app.url]: true
                  }));
                }}
              />
            ) : (
              <span>{app.name ? app.name[0].toUpperCase() : 'N/A'}</span>
            )}
          </button>
        ))}
      <button
        onClick={onEditClick}
        className="flex items-center justify-center w-12 h-12 mx-4 rounded-full 
          bg-neutral-600 text-white flex-shrink-0"
      >
        <span>Edit</span>
      </button>
    </div>
  );
}; 