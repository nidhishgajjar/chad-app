import React from "react";
import App from './App';
import './index.css';
import { SearchProvider } from "./contexts/search";
import { ViewStateProvider } from "./contexts/viewstate";

import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <ViewStateProvider>
            <SearchProvider>
                    <App tab="root" />
            </SearchProvider>
    </ViewStateProvider>
);