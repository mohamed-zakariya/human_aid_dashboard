import { gql } from 'apollo-angular';

export const GET_STORIES = gql`
  query GetStories {
    getStories {
      id
      story
      kind
      summary
      morale
    }
  }
`;

export const CREATE_STORY = gql`
  mutation CreateStory($story: String!, $kind: String!, $summary: String!, $morale: String!) {
    createStory(story: $story, kind: $kind, summary: $summary, morale: $morale) {
      id
      story
      kind
      summary
      morale
    }
  }
`;

export const UPDATE_STORY = gql`
  mutation UpdateStory($id: ID!, $story: String, $kind: String, $summary: String, $morale: String) {
    updateStory(id: $id, story: $story, kind: $kind, summary: $summary, morale: $morale) {
      id
      story
      kind
      summary
      morale
    }
  }
`;

export const DELETE_STORY = gql`
  mutation DeleteStory($id: ID!) {
    deleteStory(id: $id) {
      id
      story
      kind
      summary
      morale
    }
  }
`;