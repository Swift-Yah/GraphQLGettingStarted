let express = require('express');
let graphQLHTTP = require('express-graphql');
let { buildSchema } = require('graphql');

// Construct a schema, using GraphQL schema language
let schema = buildSchema(`
    input MessageInput {
        content: String
        author: String
    }
    
    type Message {
        id: ID!
        content: String
        author: String
    }
    
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
        catchMessage: String
        getMessage(id: ID!): Message
    }
    
    type Mutation {
        setMessage(message: String): String
        createMessage(input: MessageInput): Message
        updateMessage(id: ID!, input: MessageInput): Message
    }
`);

// If Message had any complex fields, we'd put them on this object.
class Message {
    constructor(id, { content, author }) {
        this.id = id;
        this.content = content;
        this.author = author;
    }
}

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

// Maps username to content.
let fakeMessageDatabase = {};
let fakeDatabase = {};

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
    },
    catchMessage: () => {
        return fakeMessageDatabase.message
    },
    setMessage: ({ message }) => {
        fakeMessageDatabase.message = message;

        return message;
    },
    getMessage: function ({ id }) {
        if (!fakeDatabase[id]) {
            throw new Error('no message exists with id ' + id);
        }

        return new Message(id, fakeDatabase[id]);
    },
    createMessage: function ({ input }) {
        // Create a random id for our "database"
        let id = require('crypto').randomBytes(10).toString('hex');

        fakeDatabase[id] = input;

        return new Message(id, input);
    },
    updateMessage: function ({ id, input }) {
        if (!fakeDatabase[id]) {
            throw new Error('no message exists with id ' + id);
        }

        // This replaces all old data, but some apps might want partial update.
        fakeDatabase[id] = input;

        return new Message(id, input);
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
