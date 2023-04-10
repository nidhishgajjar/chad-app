import React from "react";
import App from './App';
import './index.css';
import { FetchSearchResultsProvider } from "./contexts/fetch";
import { SearchProvider } from "./contexts/search";
import { LangInterfaceProvider } from "./contexts/langfacecontext";



import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <LangInterfaceProvider>
        <FetchSearchResultsProvider>
            <SearchProvider>
                    <App tab="root" />
            </SearchProvider>
        </FetchSearchResultsProvider>
    </LangInterfaceProvider>

);