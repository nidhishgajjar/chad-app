import React, { useState, useContext, useEffect } from "react";
import { LangInterfaceContext } from "../../../contexts/langfacecontext";

export const ShortcutChange = () => {
  const dummyShortcuts = ["Option+Space", "Control+Option+Space", "Shift+Option+Space"];
  const [selectedShortcut, setSelectedShortcut] = useState(dummyShortcuts[0]);
  const { langInterfaceVisible, setLangInterfaceVisible, quickSearchVisible, setQuickSearchVisible, changeShortcutVisible, setChangeShortcutVisible } =
  useContext(LangInterfaceContext);

  const ipcRenderer = window.electron ? window.electron.ipcRenderer : null;

  useEffect(() => {
    const handleShortcutChange = () => {
      setChangeShortcutVisible(true);
    };

    window.electron?.ipcRenderer.on("shortcut-change", handleShortcutChange);

    return () => {
      window.electron?.ipcRenderer.removeListener("shortcut-change", handleShortcutChange);
    };
  }, [setChangeShortcutVisible]);

  // Function to convert 'Option' back to 'Alt' for IPC message
  const convertShortcutForIpc = (shortcut) => {
    return shortcut.replace("Option", "Alt");
  };

  useEffect(() => {
    if (ipcRenderer) {
      if (changeShortcutVisible) {
        ipcRenderer.send("set-window-height", 200);
      } else {
        ipcRenderer.send("reset-to-search");
      }
    }
  }, [changeShortcutVisible, ipcRenderer]);

  const handleSaveShortcut = () => {
    const shortcutForIpc = convertShortcutForIpc(selectedShortcut);

    window.electron.ipcRenderer.send(
      "reset-to-search"
    );

    window.electron.ipcRenderer.send(
      "update-custom-shortcut",
      shortcutForIpc
    );

    setChangeShortcutVisible(false);
    setLangInterfaceVisible(false);
    setQuickSearchVisible(false);
  };

  const handleCancel = () => {
    setChangeShortcutVisible(false);
    setQuickSearchVisible(false);
    setLangInterfaceVisible(false);
  };

  return (
    <>
      {changeShortcutVisible === true && (
        <div className="bg-white p-4 w-full h-screen mx-auto shadow-lg rounded-md">
          <h1 className="text-xl font-bold mb-4">Change Shortcut</h1>
          <div className="mb-4">
            <label
              htmlFor="shortcut-select"
              className="block text-sm font-medium text-gray-700">
              Select a shortcut
            </label>
            <select
              id="shortcut-select"
              value={selectedShortcut}
              onChange={(e) => setSelectedShortcut(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base">
              {dummyShortcuts.map((shortcut, index) => (
                <option key={index} value={shortcut}>
                  {shortcut}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end">
            <button
              className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleSaveShortcut}>
              Save Shortcut
            </button>
            <button
              className="ml-4 text-indigo-600 font-semibold py-2 px-4 rounded-md hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};
  