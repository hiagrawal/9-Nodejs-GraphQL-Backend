const bcrypt = require('bcryptjs');

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