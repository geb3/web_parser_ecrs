import React from 'react';
import Alert from "react-bootstrap/Alert";
import {FormControl, InputGroup} from "react-bootstrap";
import Button from "react-bootstrap/Button";

const Deletealert = ({rules, setRules, show, setShow}) => {
    let temp = [...rules]
    const changeLocalData = (event) => {
        temp.splice(Number(event.target.data), 1)
        console.log(temp)
    }
    return (
        <div>
            <Alert style={{maxWidth: "60vw", zIndex: 1000, position: "absolute", top: 0, marginTop: "30vh", marginLeft: "45vw"}}  show={show} variant="danger">
                <Alert.Heading>Remove a resource</Alert.Heading>
                <h4>Enter rule id to delete it</h4>
                <InputGroup className="mb-3">
                    <InputGroup.Text>id</InputGroup.Text>
                    <FormControl
                        id="id" placeholder="rule id to remove" disabled={true} onChange={event => {changeLocalData(event)}}>
                    </FormControl>
                </InputGroup>
                <div className="d-flex justify-content-end">
                    <Button onClick={() => {setShow(false); setRules(temp)}} variant="outline-success">
                        Save
                    </Button>
                </div>
            </Alert>
        </div>
    );
};

export default Deletealert;