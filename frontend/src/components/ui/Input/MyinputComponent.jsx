import React from 'react';

const MyinputComponent = ({value, onChange}) => {
    return (
            <div className="card card-body" style={{padding: "10px 10px 10px 10px"}}>
                <input className="form-control" type="text" placeholder="Enter name or url"
                       aria-label="search input" value={value} onChange={event => onChange(event)}/>
            </div>
    );
};

export default MyinputComponent;