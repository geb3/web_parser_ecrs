var sha256 = require('./sha256.js');


document.getElementById("check").onclick = function() {
    let login = document.getElementById("login").value;
    let password = document.getElementById("passwd").value;

    if (sha256(login) == "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b" && sha256(password) == "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b") {
        alert("Yes!")
    }
    else alert("Incorrect login or password!");
}


