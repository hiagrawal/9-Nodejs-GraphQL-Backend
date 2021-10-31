const {validationResult} = require('express-validator/check');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signUp = (req,res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation Failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    //with a salt of 12 so a strength of 12
    bcrypt.hash(password, 12).then(hashedPassword => {
        const user = new User({
            email: email,
            password: hashedPassword,
            name: name
        })
        return user.save();
    })
    .then(result => {
        res.status(201).json({message: 'User Created!', userId: result._id});
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({email: email}).then(userDoc => {
        if(!userDoc){
            const error = new Error('Email Not found');
            error.statusCode = 401; //401 refers to authentication error
            throw error;
        }
        loadedUser = userDoc;
        return bcrypt.compare(password, userDoc.password)
    })
    .then(isEqual => {
        if(!isEqual){
            const error = new Error('Password is not correct');
            error.statusCode = 401; //401 refers to authentication error
            throw error;
        }
    //sign method is used to generate the json token signature. It takes first argument as some data so that it uses the data 
    //to generate the token so if data changes, token also changes so it becomes more secure
    //make a note that this data is exposed to the client and stored in client's browser so some sensitive information should not be passed there
    //we can check the same in debugger tools 'Application' tab -> Storage -> Local Storage
    //second paramter is secret key which is used to validate the token (can check at https://jwt.io/)
    //we can paste the token at https://jwt.io/ and check the payload data there. so anyone can see that data 
    //We can double check by enter the secret key and data and get that token on the left
    //If we change data or secret key there, token also gets changed
    //Third is optional paramter wherein we can give expiresIn property so even if this token gets compromised, it will be 
    //valid only for an hour and hence adds more security
    const token = jwt.sign({
        email: loadedUser.email,
        userId: loadedUser._id.toString()
    }, 'somesupersupersecretkey', {expiresIn: '1h'} )

    res.status(200).json({token: token, userId: loadedUser._id.toString()})

    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
};

exports.getStatus = (req, res, next) => {
    const userId = req.userId;
    User.findById(userId).then(user => {
        if(!user){
            const error = new Error('Not able to find Logged In User');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({status: user.status});
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
};

exports.updateStatus = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Status is empty'); 
        error.statusCode = 422;
        throw error;

    }
    const status = req.body.status;
    User.findById(req.userId).then(user => {
        if(!user){
            const error = new Error('Not able to find Logged In User');
            error.statusCode = 404;
            throw error;
        }
        user.status = status;
        return user.save();
    })
    .then(result => {
        res.status(200).json({message: 'User Updated!'})
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}