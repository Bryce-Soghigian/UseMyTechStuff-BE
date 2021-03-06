const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db/db-config')
const Users = require('../users/users-model.js');
const restricted = require('./auth-middleware');


router.post('/register', (req,res) => {
let user = req.body;

if(!user.username || !user.password){
    res.status(404).json({message: "Please enter a username or password"})
}
const hash = bcrypt.hashSync(user.password, 15);
user.password = hash;
Users.add(user)
.then((newUser) => {
    console.log(newUser);
    res.status(201).json(newUser);

})
.catch(err => {
    res.status(500).json(err)
})
})

router.post('/login', (req,res) => {
    let {username, password} = req.body;
    Users.findBy({username})
    .first()
    .then((user) => {
        if (username && bcrypt.compareSync(password, user.password)){
            req.session.user = user;
            res.status(201).json({message: 'Welcome'+ username});
        }else{
            res.status(404).json({message:"invalid username or password"})
        }
    })
    .catch((err) => {
        res.status(500).json(err)
    })
})


router.get('/logout', restricted, (req,res) => {
    if(req.session){
        req.session.destroy((err) => {
            if(err) {
                console.log(err);
                return res.status(500).json({message: "error has occured"})
            }
            res.end();
        });
    }else{
        res.end();
    }
})
module.exports = router;