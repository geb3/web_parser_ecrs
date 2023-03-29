import React, {useRef} from 'react';
import LoginForm from "./ui/LoginForm/LoginForm";

const Auth = ({checkLoginData}) => {
    const inputData = useRef();
    const logIn =  (e) => {
        e.preventDefault()
        checkLoginData([inputData.current[0].value, inputData.current[1].value])
    }
    return (
        <div className="form-signin">
            <LoginForm onSubmit={logIn} ref={inputData} />
        </div>
    );
};

export default Auth;