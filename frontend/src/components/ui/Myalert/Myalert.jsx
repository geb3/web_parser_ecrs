import React from 'react';
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import {FormControl, InputGroup} from "react-bootstrap";

const Myalert = ({show, setShow, activeId, setRules, rules}) => {
    let temp = [...rules]
    const changeLocalData = (e) => {
        if (!temp[e.target.accessKey]) temp.push({})
        temp[e.target.accessKey][e.target.id] = e.target.value
    }
    return (
        <div>
            <Alert style={{maxWidth: "60vw", zIndex: 1000, position: "absolute", top: 0, marginTop: "30vh", marginLeft: "45vw"}}  show={show}>
                <Alert.Heading>Add a resource</Alert.Heading>
                <h4>id #{activeId}</h4>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Name</InputGroup.Text>
                    <FormControl
                        accessKey={activeId} id="name" placeholder="Name of this rule"  onChange={event => {changeLocalData(event)}}>
                    </FormControl>
                </InputGroup>
                <InputGroup className="mb-3">
                    <InputGroup.Text>URL</InputGroup.Text>
                    <FormControl
                        accessKey={activeId} id="url" placeholder="Res to parse URL"  onChange={event => {changeLocalData(event)}}>
                    </FormControl>
                </InputGroup>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Tag</InputGroup.Text>
                    <FormControl
                        accessKey={activeId} id="tag" placeholder="<tag>...</tag>>"  onChange={event => {changeLocalData(event)}}>
                    </FormControl>
                </InputGroup>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Attribute</InputGroup.Text>
                    <FormControl
                        accessKey={activeId}
                        id="attribute"
                        placeholder='<tag ...></tag>>'
                        onChange={event => {changeLocalData(event)}}>
                    </FormControl>
                </InputGroup>
                <div className="d-flex justify-content-end">
                    <div style={{marginRight: "11em"}}>
                        <Button variant="outline-danger" onClick={() => {setShow(false)}}>Cancel</Button>
                    </div>
                    <div>
                        <Button onClick={() => {setShow(false); setRules(temp)}} variant="outline-success">
                        Save
                        </Button>
                    </div>
                </div>
            </Alert>
        </div>
    );
};

export default Myalert;