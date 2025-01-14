import express, { Express, Application } from 'express';
import path from 'node:path';
import db from './config/connection.js';
import routes from './routes/index.js';
import { ApolloServer } from '@apollo/server';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { authenticateToken } from './services/auth';

// Define the context type
interface Context {
    user?: {
        _id: string;
        username: string;
    };
}

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Apply the authentication middleware
app.use(authenticateToken);

// Create an instance of ApolloServer
const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
});

// Start the Apollo Server
server.start().then(() => {
    app.use('/graphql', expressMiddleware(server)); // Use Apollo Server's middleware
});

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
}

// Use routes for RESTful API endpoints
app.use(routes);

// Connect to the database and start the server
db.once('open', () => {
    const graphqlEndpoint = '/graphql'; // Define your GraphQL endpoint
    app.listen(PORT, () => {
        console.log(`🌍 Now listening on localhost:${PORT}${graphqlEndpoint}`);
    });
});

function expressMiddleware(server: ApolloServer<Context>): import("express-serve-static-core").RequestHandler<{}, any, any, import("qs").ParsedQs, Record<string, any>> {
    throw new Error('Function not implemented.');
}
