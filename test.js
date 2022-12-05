var Data = new Date().toLocaleDateString();
var Time = new Date().toLocaleTimeString().slice(0,-3);
var dateTime = String(Data + " " + Time);

console.log(dateTime);