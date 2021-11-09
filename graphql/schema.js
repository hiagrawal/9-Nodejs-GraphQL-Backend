const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type RootQuery {
        helloSample: String!
    }

    schema {
        query: RootQuery
    }

`);

module.exports = buildSchema(`
    type TestData {
        text: String!
        views: Int!
    }

    type RootQuery {
        hello: TestData!
    }

    schema {
        query: RootQuery
    }

`);



//In buildSchema, we define the 'schema' (keyword for that is schema) inside which we define the 'query' (keyword is query) 
//colon the type of query  that we define that can be of any name
//now we describe the type of query that we gave in schema that can be of any name (keyword for that is 'type <typeOfQueryName>) 
//and inside that define the name of query ('<anyName>', here in example hello) colon the type of data it is expecting
//type of data can be simple string, int, boolean or another object type that has other various paramters 
//In that case, we can define data type separately with the 'type' keyword and the same data type name that gave in queryType
//and then define the paramters that particular query is looking for

// so it is - 
// 'schema'  inside which 'query' colon queryType
// then queryType inside which data colon dataType
// then dataType inside which paramters colon it's type

//Notice, we write all this buildSchema in backslash quotes so we can write multiline data
//and exclamation represents it is mandatory field else it will throw error

//Mutation

module.exports = buildSchema(`
    type Post{
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        email: String!
        name: String!
        password: String
        status: String!
        posts: [Post!]!
    }

    type AuthData{
        token: String!
        userId: String!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
    }

    type RootMutation {
        createUser(userInput: UserInputData) : User!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }

`);

//'input' is a special keyword prvided by graphql to define the input type of data which that mutation is accepting 
//from the frontend as an input
//ID is a special type provided by graphql for id types values
//since graphql does not have date type hence for createdAt and updatedAt also, we are using String

