import gql from "graphql-tag";

export const GET_ALL_USERS = gql`
  query getAllUsers {
    getAllUsers {
      id
      name
      username
      email
      role
      gender
      birthdate
      nationality
      lastActiveDate
    }
  }
`;

export const DELETE_USER = gql`
  mutation deleteUser($userId: ID!) {
    deleteUser(userId: $userId)
  }
`;