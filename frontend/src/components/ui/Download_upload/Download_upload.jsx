import React from 'react';
import {Badge, Button, Card, Col, Container, Row} from "react-bootstrap";
import {usePosting} from "../../../hooks/UsePosting";
import FilesService from "../../../API/filesService";

const DownloadUpload = ({setUploaded}) => {
    const [sendFile, sendigFiles] = usePosting()
    const handleChangeFile = (event) => {
        setUploaded(true)
        const file = event.target.files[0]
        console.log(event.target.files[0])
        let formData = new FormData()
        formData.append('file', file)
        sendFile(async () => {
            await FilesService.uploadFile(formData).catch(console.error)
        }).catch(console.error)

    }
    return (
        <div>
            <Card style={{color: "black", marginTop: "3em"}}>
                <Card.Body>
                    <Card.Title>Excel spreadsheet</Card.Title>
                    <Card.Text as={"div"}>
                        <Container style={{paddingTop: ".5em"}}>
                            <Row>
                                <Col>
                                    <Button as={"label"} htmlFor="uploadXlsx" variant="primary" style={{marginBottom: "1em"}}>Upload file</Button>
                                    <input type="file" id="uploadXlsx" onChange={event => {handleChangeFile(event)}} hidden/>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <a href="http://localhost:8080/api/download/table_data.xlsx" download="parsingRes">
                                        <Button variant="success" style={{marginBottom: "1em"}} >Download file</Button>
                                    </a>
                                </Col>
                            </Row>
                        </Container>
                    </Card.Text>
                    <Card.Footer>Support for formats only <Badge bg="info">.xlsx</Badge></Card.Footer>
                </Card.Body>
            </Card>
        </div>
    );
};

export default DownloadUpload;