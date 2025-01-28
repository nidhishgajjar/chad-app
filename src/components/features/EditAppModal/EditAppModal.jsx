import React, { useState, useEffect } from 'react';

export const EditAppModal = ({ visible, onClose }) => {
  const [localApps, setLocalApps] = useState(() => {
    const storedApps = localStorage.getItem('apps');
    if (storedApps) {
      return JSON.parse(storedApps).map(app => app.url.replace("https://", ""));
    }
    return [];
  });
  
  const ipcRenderer = window.electron?.ipcRenderer;
  const [hasEmptyField, setHasEmptyField] = useState(false);

  useEffect(() => {
    // Check for empty fields after each change
    setHasEmptyField(localApps.some(app => !app || app.trim() === ""));
  }, [localApps]);

  const handleChange = (e, index) => {
    const updatedApps = [...localApps];
    let value = e.target.value.trim();

    // Remove "https://" prefix if present
    if (value.startsWith("https://")) {
      value = value.replace("https://", "");
    }

    updatedApps[index] = value;
    setLocalApps(updatedApps);
  };

  const handleSave = () => {
    const updatedGlobalApps = localApps
      .filter(url => url.trim() !== '') // Filter out empty URLs
      .map(url => ({ url: "https://" + url.trim() }));
    
    localStorage.setItem('apps', JSON.stringify(updatedGlobalApps));
    ipcRenderer?.send('reset-to-search');
    onClose();
  };

  const handleCancel = () => {
    ipcRenderer?.send('reset-to-search');
    onClose();
  };

  const handleAddNewApp = () => {
    setLocalApps([...localApps, ""]); // Add an empty string for the new app URL
  };

  if (!visible) return null;

  return (
    <div className="modal bg-white h-full rounded-lg p-6">
      <h2 className="text-2xl mb-4">Edit Apps</h2>

      <div className="my-4">
        {localApps.map((url, index) => (
          <div key={index} className="mb-3">
            <input 
              type="text" 
              value={url}
              onChange={e => handleChange(e, index)}
              className="p-2 border rounded w-full"
              placeholder="Enter App URL without 'https://'..."
            />
          </div>
        ))}
      </div>

      <button 
        onClick={handleAddNewApp}
        disabled={localApps.length >= 10}
        className={`border text-neutral-500 w-full px-4 py-2 mt-3 rounded-lg ${localApps.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        + Add New App
      </button>

      <div className="flex justify-end py-10">
        <button 
          onClick={handleSave} 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Save
        </button>
        <button 
          onClick={handleCancel} 
          className="bg-red-500 text-white px-4 py-2 rounded-lg ml-3"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
