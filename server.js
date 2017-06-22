let express = require('express');
let graphQLHTTP = require('express-graphql');
let { buildSchema } = require('graphql');

// Construct a schema, using GraphQL schema language
let schema = buildSchema(`
    type Query {
        hello: String
    }
`);

// The root provides a resolver function for each API endpoints.
let root = {
    hello: () => {
        return 'Hello world!';
    }
};

let app = express();
let httpSettings = {
    schema: schema,
    rootValue: root,
    graphiql: true
};

app.use('/graphql', graphQLHTTP(httpSettings));
app.listen(4000);

console.log('Running a GraphQL API server at http://localhost:4000/graphql');
