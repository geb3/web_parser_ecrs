import React from 'react';
import {Spinner} from "react-bootstrap";

const Loader = () => {
    return (
        <Spinner
        animation="border"
        variant="light">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    );
};

export default Loader;