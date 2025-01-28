import React from 'react';
import {
  FaArrowLeft,
  FaArrowRight,
  FaHome,
  FaSync,
} from "react-icons/fa";

export const NavigationBar = ({
  onHomeClick,
  onBackClick,
  onForwardClick,
  onReloadClick
}) => {
  return (
    <div className="flex items-center justify-between mb-5 rounded-lg dark:bg-neutral-800 bg-slate-100">
      <div className="flex justify-between items-center space-x-10 py-3 ml-10">
        <button className="active:scale-95" onClick={onHomeClick}>
          <FaHome className="text-neutral-500 h-5 w-5" />
        </button>
        <button className="active:scale-95" onClick={onBackClick}>
          <FaArrowLeft className="text-neutral-500 h-5 w-5" />
        </button>
        <button className="active:scale-95" onClick={onForwardClick}>
          <FaArrowRight className="text-neutral-500 h-5 w-5" />
        </button>
        <button className="active:scale-95" onClick={onReloadClick}>
          <FaSync className="text-neutral-500 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}; 