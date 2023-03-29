import React, {useState} from 'react';
import {Button, InputGroup, Form, Placeholder, FormControl} from "react-bootstrap";
import {usePosting} from "../../../hooks/UsePosting";
import ParserService from "../../../API/parserService";
const ParserPreview = ({rule}) => {
    const [btnValue, setBtnValue] = useState("to view it, click on the button")
    const [disabled, setDisabled] = useState(false)
    const [sendPreview, sending] = usePosting()
    const getPreview = () => {
        sendPreview( async () => {
            setBtnValue("loading....")
            setDisabled(true)
            await ParserService.getPreview(rule).then((res) => {setBtnValue(String(res)); setDisabled(false)})
        }).catch(console.error)
    }
    return (
        <InputGroup className="mb-3">
            <Button variant="outline-secondary" onClick={getPreview} disabled={disabled}>
                Preview
            </Button>
            <Form.Control
            aria-label="Example text with button addon"
            aria-describedby="basic-addon1"
            value={btnValue}
            disabled
            readOnly
            />
        </InputGroup>
    );
};

export default ParserPreview;