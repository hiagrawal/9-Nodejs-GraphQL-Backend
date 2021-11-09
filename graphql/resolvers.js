const bcrypt = require('bcryptjs');
const validator = require('validator');

const User = require('../models/user');

module.exports = {

    helloSample() {
        return 'Hello World'
    },

    hello() {
        return {
            text: 'Hello World',
            views: 12345
        }
    }
    
}

module.exports = {
    // createUser(args, req){
    //     const email = args.userInput.email; //way to fetch input data
    // }

    // createUser({userInput}, req){
    //     const email = userInput.email; //way to fetch input data
    // }

    //Now we need to use async await so make it a function
    createUser: async function({userInput}, req){

        //Adding validation
        const errors = [];
        if(!validator.isEmail(userInput.email)){
            errors.push({message: 'Email is invalid'});
        }
        if(validator.isEmpty(userInput.password) || !validator.isLength(userInput.password,{min:5}) ){
            errors.push({message: 'Password too short!'});
        }
        if(errors.length > 0){
            const error = new Error('Invalid Input');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const existingUser = await User.findOne({email: userInput.email});    
        if(existingUser){
            const error = new Error('User exists already!');
            throw error;
        }    
        const hashedPwd = await bcrypt.hash(userInput.password, 12);
        const user = new User({
            email: userInput.email,
            password: hashedPwd,
            name: userInput.name
        });
        const createdUser = await user.save();
        return {...createdUser._doc, _id: createdUser._id.toString()};
    }
};