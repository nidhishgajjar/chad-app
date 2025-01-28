import React, {
  useContext,
  useState,
  createContext,
} from "react";
import { ViewStateContext } from "./viewstate";

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [userInput, setUserInput] = useState("");
  const { setActiveView } = useContext(ViewStateContext);
  const [loading, setLoading] = useState(false);

  const handleInput = (event) => {
    setUserInput(event.target.value);
  };

  const handleClearClick = () => {
    setUserInput("");
    setLoading(false);
    setActiveView('none');
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
