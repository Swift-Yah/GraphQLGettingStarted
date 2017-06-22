let { graphql, buildSchema } = require('graphql');

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

graphql(schema, '{ hello }', root).then((response) => {
    console.log(response);
});
