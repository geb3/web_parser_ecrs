import React, {useEffect, useState} from 'react';
import {Badge, Button, Card, Container, FormControl, InputGroup} from "react-bootstrap";
import {usePosting} from "../../../hooks/UsePosting";
import ParserService from "../../../API/parserService";
import {useFetching} from "../../../hooks/UseFatching";

const Settings = ({setForceStart, setForceInterval}) => {
    const [daysCounter, setDaysCounter] = useState(0)
    const daysIntervalHolder = (event) => {
        setDaysCounter(event.target.value)
    }
    const [sendInterval, isSending_int] = usePosting()
    const forceInterval = () => {
        sendInterval(async () => {
            setForceInterval(true)
            await ParserService.sendForceRestart({interval: daysCounter})
        }).catch(console.error)
    }
    const [force_start, isSending] = useFetching(async () => {
        setForceStart(true)
        await ParserService.sendForceStart()
    })
    const [fetchInterval, isFetching] = useFetching(async() => {
        await ParserService.getInterval().then((data) => {let int  = data.data/1000/60/60/24;setDaysCounter(int)})
    })
    const [lastStarted, setLastStarted] = useState("unknown")
    const [nextDate, setNextDate] = useState("unknown")
    const [fetchDate, isFetch] = useFetching(async() => {
        await ParserService.getLastStarted().then(data => {setLastStarted(`${String(new Date(String(data.date)).getDate())}.${String(Number(new Date(String(data.date)).getMonth()) + 1)}.${String(new Date(String(data.date)).getFullYear())} ${String(new Date(String(data.date)).getHours())}:${String(new Date(String(data.date)).getMinutes())}`);
            let date = new Date(String(data.date))
            date.setDate(date.getDate() + Number(daysCounter))
        setNextDate(`${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`)
        })


    })
    useEffect(() => {
        fetchInterval().catch(console.error)
    }, [])
    useEffect(() => {
        fetchDate().catch(console.error)
    }, [daysCounter])
    return (
        <div>
            <Card style={{color: "black", marginTop: "3em"}}>
                <Card.Body>
                    <Card.Title>Parser settings</Card.Title>
                    <Card.Text as={"div"}>
                        <Container style={{paddingTop: ".5em"}}>
                            <p><strong>Last started <Badge style={{overflowWrap: "break-word"}} bg="secondary">{lastStarted}</Badge></strong></p>
                            <p><strong>Next start <Badge style={{overflowWrap: "break-word"}} bg="secondary">{nextDate}</Badge></strong></p>
                            <InputGroup className="mb-3">
                                <InputGroup.Text>Interval in days</InputGroup.Text>
                                <FormControl
                                    placeholder="Name of this rule" value={daysCounter}
                                    onChange={event => {daysIntervalHolder(event)}}>
                                </FormControl>
                            </InputGroup>
                            <div className="d-grid gap-1">
                                <Button variant="outline-warning" onClick={force_start}>Force start</Button>
                                <Button variant="outline-danger" onClick={forceInterval}>Force save interval and rerun</Button>
                            </div>
                        </Container>
                    </Card.Text>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Settings;