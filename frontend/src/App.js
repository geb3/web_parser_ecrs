import './styles/App.css';
import Auth from "./pages/Auth";
import {useState} from "react";
import LoginService from "./API/loginService";
import Loader from "./components/ui/Loader/Loader";
import Parser from "./pages/Parser";
import {usePosting} from "./hooks/UsePosting";
import {Alert} from "react-bootstrap";

function App() {
    const [checkLogin, isChecking] = usePosting()
    const [isLogined, setLogined] = useState(false)
    const [show, setShow] = useState(false)

    const sendLoginToServer = (loginData) => {
        checkLogin( async () => {
            await LoginService.checkLoginData(loginData).then((res) => {setLogined(res); setShow(!res);})
        }).catch(console.error)
    }

  return (
    <div className="App">
        {isChecking?
            <div className="sendLoader" style={{ position: "absolute", width:"100vw", height:"100vh", textAlign: "center", zIndex: 10000, top:0, display: "flex", justifyContent: "center"}}><div style={{marginTop:"45vh"}}><Loader/></div></div>
            : <div style={{display:"none"}}></div>
        }
        {show?
            <Alert variant="danger" onClose={() => setShow(false)} dismissible>
                <Alert.Heading>Incorrect login or password specified</Alert.Heading>
            </Alert>
            : <div style={{display: "none"}}></div>
        }
        {isLogined?
            <Parser/>
            : <Auth checkLogin={sendLoginToServer}/>
        }

    </div>
  );
}

export default App;
