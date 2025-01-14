//import 
import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
        email
        savedBooks {
            bookId
            authors
            description
            title
            image
            link
        }
      }
    }
  }
`;
export const ADD_USER = gql`
    mutation addUser($username: String!, $email: String!, $password: String!) {
        addUser(username: $username, email: $email, password: $password) {
            token
            user {
                _id
                username
                email
            }
        }
    }
`;
export const SAVE_BOOK = gql`
    mutation saveBook($authors, $description, $title, $bookId, $image, $link) {
        savebook(authors: $authors, description: $description, title: $title, bookId: $bookId, image: $image, link: $link) {
            _id
            savedBooks {
                bookId
                authors
                description
                title
                image
                link
            }
        }
    }
`;
export const REMOVE_BOOK = gql`
    mutation removeBook($bookId: ID!) {
        removeBook(bookId: $bookId) {
            _id
            savedBooks {
                bookId
                authors
                description
                title
                image
                link
            }
        }
    }
`;