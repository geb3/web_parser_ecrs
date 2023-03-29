import React from 'react';
import {Accordion, Button, FormControl, InputGroup} from "react-bootstrap";
import ParserPreview from "../ParserPreview/ParserPreview";

const ResourceCard = ({data, activeId, setRules, rules}) => {
    const changeLocalData = (e) => {
        let temp = [...rules]
        temp[e.target.accessKey][e.target.id] = e.target.value
        setRules(temp)
    }
    return (
        <Accordion.Item eventKey={String(activeId)}>
            <Accordion.Header>{data.name}</Accordion.Header>
            <Accordion.Body>
                <h4 style={{textAlign: "left"}}>id #{activeId}</h4>
                <hr/>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Name</InputGroup.Text>
                    <FormControl
                        accessKey={activeId} id="name" placeholder="Name of this rule" defaultValue={data.name} onChange={event => {changeLocalData(event)}}>
                    </FormControl>
                </InputGroup>
                <InputGroup className="mb-3">
                    <InputGroup.Text>URL</InputGroup.Text>
                    <FormControl
                        accessKey={activeId} id="url" placeholder="Res to parse URL" defaultValue={data.url} onChange={event => {changeLocalData(event)}}>
                    </FormControl>
                </InputGroup>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Tag</InputGroup.Text>
                    <FormControl
                        accessKey={activeId} id="tag" placeholder="<tag>...</tag>>" defaultValue={data.tag} onChange={event => {changeLocalData(event)}}>
                    </FormControl>
                </InputGroup>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Attribute</InputGroup.Text>
                    <FormControl
                        accessKey={activeId}
                        id="attribute"
                        placeholder='<tag ...></tag>>'
                        defaultValue={data.attribute}
                        onChange={event => {changeLocalData(event)}}>
                    </FormControl>
                </InputGroup>
                <hr className="hr hr-blurry"/>
                <ParserPreview rule={data}/>
                <div className="d-grid gap-1">
                 <Button variant="outline-danger" style={{marginBottom: ".2em"}} onClick={event => {
                     let temp = [...rules]
                     temp.splice(Number(activeId), 1)
                     setRules(temp)
                 }}> - Remove a resource</Button>
                </div>
            </Accordion.Body>
        </Accordion.Item>
    );
};

export default ResourceCard;