const router = require("express").Router();
const { checkUsernameExists, validateRoleName } = require('./auth-middleware');
const User = require('../users/users-model')
const { JWT_SECRET } = require("../secrets"); // use this secret!
const { tokenBuilder } = require('./auth-helpers')
const bcrypt = require('bcryptjs')
const BCRYPT_ROUNDS = 8

router.post("/register", validateRoleName, (req, res, next) => {
  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */
  
  const user = req.body;
  user.password = bcrypt.hashSync(user.password, BCRYPT_ROUNDS)
  User.add(user)
    .then( response => {
      console.log(response);
      res.status(201).json(response)
    })
    .catch( next );
  
});


router.post("/login", checkUsernameExists, (req, res, next) => {
  /**
   [POST] /api/auth/login { "username": "sue", "password": "1234" }
   
   response:
   status 200
   {
     "message": "sue is back!",
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }
    
    The token must expire in one day, and must provide the following information
    in its payload:
    
    {
      "subject"  : 1       // the user_id of the authenticated user
      "username" : "bob"   // the username of the authenticated user
      "role_name": "admin" // the role of the authenticated user
    }
    */
  const { username, password } = req.body;

  User.findBy({ username })
    .then( ([userFromDb]) => {
      // 0. findBy returns an array, so deconstruct in .then is ~ index[0]
      // 1. Check that user exists & password is valid
      // 2. If good, create token
      if ( userFromDb && bcrypt.compareSync(password, userFromDb.password)){
        const token = tokenBuilder(userFromDb);
        res.json({
          message: `${username} is back!`,
          token: token,
        })
      } else {
        // Write the message here OR use next()
        // res.status(401).json({ message: 'Wrong password - Need to update this msg'})
        next({ status: 401, message: 'Invalid Credentials' })
      }

    })
    .catch( next );

});

module.exports = router;
