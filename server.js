let express = require('express');
let graphQLHTTP = require('express-graphql');
let { buildSchema } = require('graphql');

// Construct a schema, using GraphQL schema language
let schema = buildSchema(`
    type RandomDice {
        numSides: Int!
        rollOnce: Int!
        roll(numRolls: Int!): [Int]
    }

    type Query {
        hello: String
        quoteOfTheDay: String
        random: Float!
        rollThreeDices: [Int]
        rollDice(numDice: Int!, numSides: Int): [Int]
        getDice(numSides: Int): RandomDice
    }
`);

// This class implements the RandomDice GraphQL type.
class RandomDice {
    constructor(numSides) {
        this.numSides = numSides;
    }

    rollOnce() {
        return 1 + Math.floor(Math.random() * this.numSides);
    }

    roll({ numRolls }) {
        return new Array(numRolls).fill().map((_, i) => i + 1).map(_ => this.rollOnce());
    }
}

// The root provides a resolver function for each API endpoints.
let root = {
    hello: () => {
        return 'Hello world!';
    },
    quoteOfTheDay: () => {
        return Math.random() < 0.5 ? 'Take it easy' : 'Salvation comes from Jesus';
    },
    random: () => {
        return Math.random();
    },
    rollThreeDices: () => {
        return [1, 2, 3].map(_ => 1 + Math.floor(Math.random() * 6));
    },
    rollDice: ({ numDice, numSides }) => {
        return new Array(numDice).fill().map((_, i) => i + 1).map(_ => 1 + Math.floor(Math.random() * (numSides || 6)));
    },
    getDice: ({ numSides }) => {
        return new RandomDice(numSides || 6);
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
