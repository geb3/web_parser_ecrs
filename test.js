import {rules} from "./public/scripts/parser/check/rules.js";


console.log(rules);

let id = Object.keys(rules["id"]);
id.forEach((id)=>{
    if (id == "1") console.log("Yes");
    else console.log("No");
})
console.log(id);
// console.log(id);s9
// console.log(idElem);





// console.log(delete rules["id"]);
// delete rules["id"][lastId];
// console.log(rules);