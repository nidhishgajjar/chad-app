import React from 'react';
import { NavigationBar } from '../../features/Nav/NavigationBar';
import { ViewStateContext } from "../../../contexts/viewstate";
import { useContext } from 'react';
import SearchContext from '../../../contexts/search';



const AIAgentWindow = ({currentQuery}) => {

  const { setActiveView, setCurrentQuery } = useContext(ViewStateContext);
  const { handleClearClick } = useContext(SearchContext);

  const handleHomeClick = () => {
      setActiveView('none');
      setCurrentQuery("");
      handleClearClick();
    }

  return (
    <div>
      <NavigationBar onHomeClick={handleHomeClick} />
      <div>AIAgent</div>
      <div>{currentQuery}</div>
    </div>
  );
};

export default AIAgentWindow;