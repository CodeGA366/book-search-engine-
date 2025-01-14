import express, { Application } from 'express';
import path from 'node:path';
import mongooseConnection from './config/connection.js';
import routes from './routes/index.js';
import { ApolloServer } from '@apollo/server';
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers.js';
import { authenticateToken } from './services/auth.js';
import { expressMiddleware } from '@apollo/server/express4'; // Import expressMiddleware

// Define the context type
interface Context {
    user?: {
        _id: string;
        username: string;
    };
}

// Create an instance of Express
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

// Start the Apollo Server and apply middleware
server.start().then(() => {
    app.use('/graphql', expressMiddleware(server) as unknown as express.RequestHandler); // Correctly apply the middleware
});

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
}

// Use routes for RESTful API endpoints
app.use(routes);

// Connect to the database and start the server
mongooseConnection.once('open', () => {
    app.listen(PORT, () => {
        console.log(`🌍 Now listening on localhost:${PORT}/graphql`);
    });
});