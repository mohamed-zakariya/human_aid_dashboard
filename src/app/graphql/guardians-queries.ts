import gql from "graphql-tag";

export const GET_ALL_GUARDIANS = gql`
    query getAllParentsWithChildren {
      getAllParentsWithChildren {
        id
        name
        gender
        email
        nationality
        phoneNumber
        birthdate
        linkedChildren {
          username
        }
      }
    }
  `;


export const UPDATE_GUARDIAN = gql`
    mutation updateParent($id: ID!, $input: ParentUpdateInput!) {
      updateParent(id: $id, input: $input) {
        id
        name
        gender
        email
        nationality
        phoneNumber
        birthdate
        linkedChildren {
          username
        }
      }
    }
  `;

export  const DELETE_GUARDIAN = gql`
    mutation deleteParentAndChildren($parentId: ID!) {
      deleteParentAndChildren(parentId: $parentId)
    }
  `;


export const CREATE_GUARDIAN = gql`
    mutation createParent($input: ParentCreateInput!) {
      createParent(input: $input) {
        id
        name
        gender
        email
        nationality
        phoneNumber
        birthdate
        linkedChildren {
          username
        }
      }
    }
  `;