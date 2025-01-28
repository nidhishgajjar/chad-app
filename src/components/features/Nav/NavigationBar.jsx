import React from 'react';
import { motion } from 'framer-motion';

export const NavigationBar = ({ onHomeClick }) => {
  return (
    <div className="flex items-center h-12 px-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onHomeClick}
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
            />
          </svg>
        </motion.button>
        {/* <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700" /> */}

      </div>
    </div>
  );
}; 