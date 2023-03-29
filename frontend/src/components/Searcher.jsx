import React from 'react';
import MyinputComponent from "./ui/Input/MyinputComponent";

const Searcher = ({filter, setFilter}) => {
    return (
        <MyinputComponent
            value={filter.query}
            onChange={e =>  setFilter({...filter, query: e.target.value})}
        />
    );
};

export default Searcher;