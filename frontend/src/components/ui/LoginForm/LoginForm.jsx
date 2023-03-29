import React from 'react';
import {Form, FloatingLabel, Button} from 'react-bootstrap';

const LoginForm = React.forwardRef((props, ref) => {
    return (
        <Form ref={ref}>
            <FloatingLabel
                label="Username"
                controlId="AuthUserName"
                className="mb-3">
                <Form.Control placeholder="username"/>
            </FloatingLabel>
            <FloatingLabel controlId="AuthPasswd" label="Password">
                <Form.Control type="password" placeholder="Password" />
            </FloatingLabel>
            <div className="d-grid gap-2">
                <Button variant="primary" onClick={props.onSubmit} size="lg" style={{marginTop: "1em"}}>LogIn</Button>
            </div>
        </Form>
    );
})

export default LoginForm;