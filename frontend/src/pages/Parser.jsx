import React, {useEffect, useState} from 'react';
import {
    Container,
    Row,
    Col,
    Button,
    Accordion,
    Card,
    Badge,
    OverlayTrigger,
    Tooltip,
    InputGroup, FormControl, Alert
} from "react-bootstrap";
import ResourceCard from "../components/ui/ResourceCard/ResourceCard";
import Navbar from "../components/ui/Navbar/Navbar";
import {useFetching} from "../hooks/UseFatching";
import RulesService from "../API/rulesService";
import Loader from "../components/ui/Loader/Loader";
import Myalertlert from "../components/ui/Myalert/Myalert";
import ParserService from "../API/parserService";
import {usePosting} from "../hooks/UsePosting";
import DownloadUpload from "../components/ui/Download_upload/Download_upload";
import Settings from "../components/ui/Settings/Settings";
import SyncBtn from "../components/ui/Sync_btn/SyncBtn";
import Searcher from "../components/Searcher";
import {useRules} from "../hooks/UseRules";

const Parser = () => {
    const [rules, setRules] = useState([])
    const [filter, setFilter] = useState({sort:"", query: ""});
    const [getRules, isLoading] = useFetching(async () => {
        await RulesService.getRulesData().then((data) =>{
            console.log(data)
            setRules(data)})
    })
    const [showAlert, setShowAlert] = useState(false)

    const sortedRules = useRules(rules, filter.sort, filter.query)

    useEffect(() => {
        console.log('fetching rules...')
        getRules().catch(console.error)
    }, [])
    const renderToolTip = (props) => {
        return(
            <Tooltip id="button-tooltip" {...props}>
                The changes will take effect at the next launch of the parser
            </Tooltip>
        )
    }

    const addCard = (event) => {
        if (!showAlert){
            setShowAlert(true)
        }
    }
    const [showSucc, setShowSucc] = useState(false)
    const [saveAll, isSaving] = usePosting()
    const saveServer = () => {
        saveAll(async () => {
            await ParserService.save(rules).then(() => setShowSucc(true))
        }).catch(console.error)
    }
    const [forceStart, setForceStart] = useState(false)
    const [forceInterval, setForceInterval] = useState(false)
    const [uploaded, setUploaded] = useState(false)
    return (
        <div>
            {isLoading?
                <div className="sendLoader" style={{ position: "absolute", width:"100vw", height:"100vh", textAlign: "center", zIndex: 10000, top:0, display: "flex", justifyContent: "center"}}><div style={{marginTop:"45vh"}}><Loader/></div></div>
                : <div style={{display:"none"}}></div>}
            {isSaving?
                <div className="sendLoader" style={{ position: "absolute", width:"100vw", height:"100vh", textAlign: "center", zIndex: 10000, top:0, display: "flex", justifyContent: "center"}}><div style={{marginTop:"45vh"}}><Loader/></div></div>
                : <div style={{display:"none"}}></div>}
            }
            {showSucc?
                <Alert variant="success" onClose={() => setShowSucc(false)} dismissible>
                    <Alert.Heading>Changes were successfully sent to the server</Alert.Heading>
                </Alert>
                : <div style={{display: "none"}}></div>
            }
            {forceStart?
                <Alert variant="success" onClose={() => setForceStart(false)} dismissible>
                    <Alert.Heading>Parser successfully started</Alert.Heading>
                </Alert>
                : <div style={{display: "none"}}></div>
            }
            {forceInterval?
                <Alert variant="success" onClose={() => setForceInterval(false)} dismissible>
                    <Alert.Heading>Interval saved successfully and Parser successfully started</Alert.Heading>
                </Alert>
                : <div style={{display: "none"}}></div>
            }
            {uploaded?
                <Alert variant="success" onClose={() => setUploaded(false)} dismissible>
                    <Alert.Heading>The table was successfully uploaded</Alert.Heading>
                </Alert>
                : <div style={{display: "none"}}></div>
            }
            <Navbar/>
            <Myalertlert rules={rules} setRules={setRules} activeId={rules.length} show={showAlert} setShow={setShowAlert}/>

            <Container style={{color: "white"}}>
                <Row>
                    <Col md={7}>
                        <Card style={{color: "black", marginTop: "3em"}}>
                            <Card.Body>
                                <Card.Title>
                                    <h2 style={{position: "relative"}}>Parsing sites
                                        <Badge pill bg="secondary" style={{position: "absolute", top: 0, scale: "70%"}}>{rules.length}
                                        </Badge>
                                        <span style={{marginLeft: "2em"}}><SyncBtn getRules={getRules}/></span>
                                    </h2>
                                    <Searcher filter={filter} setFilter={setFilter}/>
                                </Card.Title>
                                <Card.Text as={"div"}>
                                    <div style={{overflowY: "scroll", maxHeight: "50vh"}}>

                                        <Accordion defaultActiveKey="0" style={{marginTop: "1em", marginBottom: "1em"}}>
                                            {
                                                sortedRules.map((data, index) => <ResourceCard key={index} activeId={index} data={data} setRules={setRules} rules={rules}/>)
                                            }
                                        </Accordion>
                                    </div>
                                </Card.Text>
                                <Card.Footer>
                                    <div className="d-grid gap-1">
                                        <Button variant="outline-primary" style={{marginBottom: ".2em"}} onClick={event => {addCard(event)}}> + Add a resource</Button>
                                    </div>
                                </Card.Footer>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={1}>
                        <div className="vr vr-blurry" style={{height: "95%", marginTop: '.5em'}}></div>
                    </Col>
                    <Col md={4}>
                      <DownloadUpload setUploaded={setUploaded}/>
                        <Settings setForceInterval = {setForceInterval} setForceStart={setForceStart}/>
                        <div className="d-grid gap-1" style={{marginTop: "2em"}}>
                            <OverlayTrigger delay={{show: 50, hide: 400}} overlay={renderToolTip} placement="top">
                                <Button variant="primary" onClick={saveServer}>Save all changes</Button>
                            </OverlayTrigger>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Parser;