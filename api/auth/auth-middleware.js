const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../secrets');
const User = require("../users/users-model.js");


const restricted = (req, res, next) => {
  /*
    If the user does not provide a token in the Authorization header:
    status 401
    {
      "message": "Token required"
    }

    If the provided token does not verify:
    status 401
    {
      "message": "Token invalid"
    }

    Put the decoded token in the req object, to make life easier for middlewares downstream!
  */
  // If no token is available; end function and pass an error object to next
  const token = req.headers.authorization
  if (!token) {
    return next({ status: 401, message: 'Token required'});
  }
  // Verify token
  // if we get an error msg; end function and pass an error object to next
  // if found; set the decoded response to the token 
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return next({ status: 401, message: "Token invalid" })
    }
    req.decodedJwt = decoded; // Token payload defined in token builder
    next();
  })

}

const only = role_name => (req, res, next) => {
  /*
    If the user does not provide a token in the Authorization header with a role_name
    inside its payload matching the role_name passed to this function as its argument:
    status 403
    {
      "message": "This is not for you"
    }

    Pull the decoded token from the req object, to avoid verifying it again!
  */
 
  // NOTE: req.decodedJwt hold the token payload and options defined in tokenBuilder
  if (req.decodedJwt.role_name === role_name){
    next();
  } else {
    next({ status: 403, message: 'This is not for you'})
  }

}


const checkUsernameExists = (req, res, next) => {
  /*
    If the username in req.body does NOT exist in the database
    status 401
    {
      "message": "Invalid credentials"
    }
  */
  const { username } = req.body;
  User.findBy({ username })
    .then( response => {
      if (response){
        next()
      } else {
        next({ status: 401, message: 'Invalid credentials'})
      }
    })
    .catch(next);
}


const validateRoleName = (req, res, next) => {
  /*
    If the role_name in the body is valid, set req.role_name to be the trimmed string and proceed.

    If role_name is missing from req.body, or if after trimming it is just an empty string,
    set req.role_name to be 'student' and allow the request to proceed.

    If role_name is 'admin' after trimming the string:
    status 422
    {
      "message": "Role name can not be admin"
    }

    If role_name is over 32 characters after trimming the string:
    status 422
    {
      "message": "Role name can not be longer than 32 chars"
    }
  */
  
  if ( req.body.role_name === undefined || req.body.role_name.trim().length === 0 ){
    req.body.role_name = 'student'
    return next();
  }
  
  req.body.role_name = req.body.role_name.trim();
  
  if ( req.body.role_name.length > 32 ){
    return next({ status: 422, message: "Role name can not be longer than 32 chars"})
  }
  if ( req.body.role_name === 'admin' ){
    return next({ status: 422, message: "Role name can not be admin"})
  }

  next();
}

module.exports = {
  restricted,
  checkUsernameExists,
  validateRoleName,
  only,
}
