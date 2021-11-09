const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader){
        req.isAuth = false;
        return next();
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, 'somesupersecretsecret'); 
        //verify will decode the token as well as verify the same and if verified, returns the decoded data that we had sent (email and userId)
        //we also have a token.decode() method also but that only decodes the token and not verify
    }
    catch(err){
        req.isAuth = false;
        return next();
    }
    //checking if decodedToken is not undefined, which would be the case if it didnt fail technically but was also not able to verify the token
    //if it verified then decodedToken will have the token data
    if(!decodedToken){ 
        req.isAuth = false;
        return next();
    }
    req.userId = decodedToken.userId;
    req.isAuth = true;
    next();
}