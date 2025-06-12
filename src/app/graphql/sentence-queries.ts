import { gql } from 'apollo-angular';

export const GET_SENTENCES = gql`
  query GetSentences {
    getSentences {
      id
      sentence
      level
    }
  }
`;

export const CREATE_SENTENCE = gql`
  mutation CreateSentence($sentence: String!, $level: String!) {
    createSentence(sentence: $sentence, level: $level) {
      id
      sentence
      level
    }
  }
`;

export const UPDATE_SENTENCE = gql`
  mutation UpdateSentence($id: ID!, $sentence: String, $level: String) {
    updateSentence(id: $id, sentence: $sentence, level: $level) {
      id
      sentence
      level
    }
  }
`;

export const DELETE_SENTENCE = gql`
  mutation DeleteSentence($id: ID!) {
    deleteSentence(id: $id) {
      id
      sentence
      level
    }
  }
`;
