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
            <p className="mt-5 mb-3 text-muted">© 2023 - <a href="https://github.com/sirok1">sirok1</a></p>
        </div>
    );
};

export default Auth;