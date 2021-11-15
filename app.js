const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const {graphqlHTTP} = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/auth');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        //cb(null, new Date().toISOString() + '-' + file.originalname);
        cb(null, uuidv4() + '-' + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype=== 'image/png' || file.mimetype=== 'image/png' || file.mimetype=== 'image/png'){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
}

//app.use(bodyParser.urlencoded()); //x-www-form-urlencoded <form>
app.use(bodyParser.json()); //application/json
app.use(multer({storage:fileStorage, fileFilter:fileFilter}).single('image')); //'image' is the field name in which it is getting the image that we have set in frontend 'formData' 'image' field 
app.use('/images', express.static(path.join(__dirname, 'images'))); //when it get path '/images', then go to images folder

//this is required so that request from other domain can access our server, methods and they dont get CORS error
app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //allow access from all domains //can mention specific domain also
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE'); //can specify all or whatever methods we want request from other domain to access
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); 
    //this is headers client side code (frontend) might set on their requests like we set for 'application/json'. 
    //If this allow headers for content type was not added here, our request would have failed and would CORS error
    if(req.method === 'OPTIONS'){
        return res.sendStatus(200);
    }
    next();
});

//so whatever we used to do in routes earlier, we do it here
//every requests that comes through will pass through this auth middleware but it will not deny the request like in rest apis
//but it will return isAuth true false indicating if user is authenticated or not which we then will handle in resolvers
app.use(auth);

//if getting post-image url then saving the imge, sending the image path and deleting the old image
app.put('/post-image', (req, res, next) => {
    if(!req.isAuth){
        throw new Error('Not authenticated!');
    }
    if(!req.file){
        return res.status(200).json({message: 'File Not Found!'});
    }
    if(req.body.oldPath){
        clearImage(req.body.oldPath);
    }
    return res.status(201).json({message: 'File Stored', filePath: req.file.path.replace("\\","/")});
})

app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err){
        if(!err.originalError){
            return err;
        }
        const data = err.originalError.data;
        const message = err.message || 'An error occured!';
        const code = err.originalError.code || 500;
        return {message: message, status: code, data: data};
    }
}));

app.use((error, req, res, next) => {
    console.log(error);
    const message = error.message;
    const status = error.statusCode || 500;
    const data = error.data;
    res.status(status).json({message: message, data: data});
})

mongoose.connect('mongodb+srv://MongoDbUser:MongoDbUser@cluster0.kij6e.mongodb.net/GraphQL?retryWrites=true&w=majority')
.then(result => {
    console.log('connected!');
    app.listen(8080);
})
.catch(err => {
    console.log(err);
})

const clearImage = (filePath) => {
    filePath = path.join(__dirname, '..', filePath)
    fs.unlink(filePath, err => {
        console.log(err);
    });
}

