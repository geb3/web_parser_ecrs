# Web Parser

![](https://komarev.com/ghpvc/?username=your-geb3)

image.png

### Run Server
Default Port = 3000
```
export PORT=4200 && npm run serve
```

### Add a User
Edit the file user.js
```
export var users = {
    "admin": "1",
    "user name": "password",
};
```

### Check a Users
Add after address /users/list
```
http://localhost:3000/users/list
```

### Package Versions:
1.  "nodejs" = "16.17.0",
2.  "npm" = "8.15.0",
3.  "ejs": "3.1.8",
4.  "express": "4.18.2",