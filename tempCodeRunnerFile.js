let id = Object.keys(rules["id"]);
id.forEach((el) => {
    console.log(el, Object.values(rules["id"][el]));
})