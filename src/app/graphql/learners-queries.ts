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
      parentId
    }
  }
`;

export const DELETE_USER = gql`
  mutation deleteUser($userId: ID!) {
    deleteUser(userId: $userId)
  }
`;


export  const sendInactiviteEmail = gql`
  mutation($userId: ID!, $parentId: ID) {
    sendInactivityEmailToUser(userId: $userId, parentId: $parentId) {
      message
      success
    }
  }
  `;
