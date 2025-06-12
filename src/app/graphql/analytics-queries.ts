import gql from "graphql-tag";

export const GET_USER_STATS = gql`
  query getUserStats {
    getUserStats {
      numAdults
      numChildren
      numParents
    }
  }
`;


export const GET_LEVELS_FOR_EXERCISES = gql`
  query GetLevelsForExercises {
    getLevelsForExercises {
      name
      levels {
        level_number
        name
        games {
          name
        }
      }
    }
  }
`;