import gql from 'graphql-tag';

export const GET_WORDS = gql`
  query getWords {
    getWords {
      id
      word
      level
      synonym
      imageUrl
    }
  }
`;

export const DELETE_WORD = gql`
  mutation deleteWord($id: ID!) {
    deleteWord(id: $id) {
      id
      word
      level
      synonym
      imageUrl
    }
  }
`;

export const UPDATE_WORD = gql`
  mutation updateWord($id: ID!, $word: String, $level: String, $synonym: String, $image: Upload) {
    updateWord(id: $id, word: $word, level: $level, synonym: $synonym, image: $image) {
      id
      word
      level
      synonym
      imageUrl
    }
  }
`;

export const ADD_WORD_MUTATION = gql`
  mutation CreateWord($word: String!, $level: String!, $synonym: String, $image: Upload) {
    createWord(word: $word, level: $level, synonym: $synonym, image: $image) {
      id
      word
      level
      synonym
      imageUrl
    }
  }
`;  