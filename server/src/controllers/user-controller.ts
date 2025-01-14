import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import { signToken } from '../services/auth.js';

// Get a single user by either their id or their username
export const getSingleUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const foundUser = await User.findOne({
            $or: [{ _id: req.user ? req.user._id : req.params.id }, { username: req.params.username }],
        });

        if (!foundUser) {
            res.status(400).json({ message: 'Cannot find a user with this id!' });
            return;
        }

        res.json(foundUser);
    } catch (error) {
        next(error); // Pass the error to the next middleware
    }
};

// Create a user, sign a token, and send it back
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await User.create(req.body);

        if (!user) {
            res.status(400).json({ message: 'Something is wrong!' });
            return;
        }

        const token = signToken(user.username, user.password, user._id);
        res.json({ token, user });
    } catch (error) {
        next(error); // Pass the error to the next middleware
    }
};

// Login a user, sign a token, and send it back
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });
        if (!user) {
            res.status(400).json({ message: "Can't find this user" });
            return;
        }

        const correctPw = await user.isCorrectPassword(req.body.password);

        if (!correctPw) {
            res.status(400).json({ message: 'Wrong password!' });
        }

        const token = signToken(user.username, user.password, user._id);
        res.json({ token, user });
    } catch (error) {
        next(error); // Pass the error to the next middleware
    }
};

// Save a book to a user's `savedBooks` field
export const saveBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user._id },
            { $addToSet: { savedBooks: req.body } },
            { new: true, runValidators: true }
        );
        res.json(updatedUser);
    } catch (error) {
        next(error); // Pass the error to the next middleware
    }
};

// Remove a book from `savedBooks`
export const deleteBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user._id },
            { $pull: { savedBooks: { bookId: req.params.bookId } } },
            { new: true }
        );
        if (!updatedUser) {
            res.status(404).json({ message: "Couldn't find user with this id!" });
            return;
        }
        res.json(updatedUser);
    } catch (error) {
        next(error); // Pass the error to the next middleware
    }
};