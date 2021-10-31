const express = require('express');
const {body} = require('express-validator');

const authController = require('../controllers/auth');

const User = require('../models/user');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put('/signup', [
    body('email').isEmail().withMessage('Please enter a valid email').custom((value, {req}) => {
        return User.findOne({email: value}).then(userDoc => {
            if(userDoc){
                return Promise.reject('Email already exists');
            }
        })
    }).normalizeEmail(),
    body('password').trim().isLength({min:5}),
    body('name').trim().not().isEmpty()
], authController.signUp);

router.post('/login', authController.login);

router.get('/status', isAuth, authController.getStatus);

router.patch('/status', isAuth, [
    body('status').trim().not().isEmpty().withMessage('Status is empty')
], authController.updateStatus);

module.exports = router;