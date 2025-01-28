import React, {
  useContext,
  useState,
  createContext,
} from "react";
import { LangInterfaceContext } from "./langfacecontext";

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {

  const [userInput, setUserInput] = useState("");
  const { setQuickSearchVisible } = useContext(LangInterfaceContext);
  const [loading, setLoading] = useState(false);


  const handleInput = (event) => {
    setUserInput(event.target.value);
  };


  const handleClearClick = () => {
    setUserInput("");
    setLoading(false);
    setQuickSearchVisible(false);
  };

  return (
    <SearchContext.Provider
      value={{
        userInput,
        setUserInput,
        handleInput,
        handleClearClick,
        loading,
        setLoading,
      }}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext;
