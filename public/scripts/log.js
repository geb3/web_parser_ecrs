export function dateTime(req, res, next) {
    let Data = new Date().toLocaleDateString();
    let Time = new Date().toLocaleTimeString().slice(0,-3);
    req.dateTime = String(Data + " " + Time);
    next();
}