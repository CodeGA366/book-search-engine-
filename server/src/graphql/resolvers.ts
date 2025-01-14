import User from '../models/User.js';
import bookSchema from '../models/Book';
import { ApolloError } from 'apollo-server-core'; // Import ApolloError from apollo-server-core
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Define a custom AuthenticationError class
class AuthenticationError extends ApolloError {
    constructor(message: string) {
        super(message, 'UNAUTHENTICATED');
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}

export const resolvers = {
    Query: {
        me: async (_parent: any, args: any, context: any) => {
            if (context.user) {
                const userData = await User.findById(context.user._id).populate('savedBooks');
                return userData;
            }
            throw new AuthenticationError('Not logged in');
        }
    },
    Mutation: {
        login: async (_parent: any, { email, password }: { email: string, password: string }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('Incorrect email');
            }
            const correctPw = await bcrypt.compare(password, user.password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect password');
            }
            if (!process.env.JWT_SECRET_KEY) {
                throw new Error('JWT_SECRET_KEY is not defined');
            }
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '2h' });
            return { token, user };
        },
        addUser: async (_parent: any, { username, email, password }: { username: string; email: string; password: string }) => {
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({ username, email, password: hashedPassword });
        
            const secretKey = process.env.JWT_SECRET_KEY;
            if (!secretKey) {
                throw new Error('JWT secret key is not defined');
            }
        
            const token = jwt.sign({ _id: user._id }, secretKey, { expiresIn: '2h' });
            return { token, user };
        },
        saveBook: async (_: any, { authors, description, title, bookId, image, link }: { authors: string[], description: string, title: string, bookId: string, image: string, link: string }, context: any) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    context.user._id,
                    { $addToSet: { savedBooks: { authors, description, title, bookId, image, link } } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        removeBook: async (_: any, { bookId }: { bookId: string }, context: any) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    context.user._id,
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    }
}