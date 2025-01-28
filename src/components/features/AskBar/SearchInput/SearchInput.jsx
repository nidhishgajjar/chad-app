import React from 'react';

export const SearchInput = ({ value, onChange, ipcRenderer }) => {
  const adjustTextAreaHeight = (textarea) => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";

    const maxHeight = parseInt(getComputedStyle(textarea).maxHeight, 10);
    if (textarea.scrollHeight < maxHeight) {
      ipcRenderer?.send("textarea-height-changed", textarea.scrollHeight);
    } else if (textarea.scrollHeight > maxHeight) {
      ipcRenderer?.send("textarea-height-changed", maxHeight);
    }
  };

  const handleInputWithAdjustment = (e) => {
    onChange(e);
    adjustTextAreaHeight(e.target);
  };

  return (
    <div>
      <textarea
        rows="1"
        autoFocus
        placeholder="Airlight - ask anything"
        value={value}
        onChange={handleInputWithAdjustment}
        className="custom-scrollbar w-full px-3 py-1 opacity-90 absolute 
          bg-neutral-300 placeholder:text-neutral-500 text-neutral-800 
          dark:bg-neutral-800 placeholder:dark:text-neutral-500 dark:text-neutral-100 
          text-xl font-helvetica-neue outline-none tracking-wider resize-none 
          overflow-auto max-h-96"
        style={{ lineHeight: "2" }}
      />
    </div>
  );
}; 