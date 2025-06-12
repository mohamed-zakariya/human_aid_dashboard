// analytics.service.ts
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { GET_LEVELS_FOR_EXERCISES, GET_USER_STATS } from '../../graphql/analytics-queries';

// Updated query for user activity analytics
const GET_ALL_USERS_WITH_ACTIVITY = gql`
  query getAllUsers {
    getAllUsers {
      nationality
      gender
      lastActiveDate
    }
  }
`;

// New queries for analytics
const GET_ALL_USERS_NATIONALITY = gql`
  query getAllUsers {
    getAllUsers {
      nationality
    }
  }
`;

const GET_ALL_USERS_WITH_GENDER = gql`
  query getAllUsers {
    getAllUsers {
      nationality
      gender
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(private apollo: Apollo) {}

  getUserStats(): Observable<{ numAdults: number; numChildren: number; numParents: number }> {
    return this.apollo.watchQuery<{ getUserStats: { numAdults: number; numChildren: number; numParents: number } }>({
      query: GET_USER_STATS
    }).valueChanges.pipe(
      map(result => result.data.getUserStats)
    );
  }

  getExercises() {
    return this.apollo
      .watchQuery<{ getLevelsForExercises: any[] }>({
        query: GET_LEVELS_FOR_EXERCISES
      })
      .valueChanges.pipe(
        map(result => result.data.getLevelsForExercises)
      );
  }  

  // Updated method to get all user data including activity
  getAllUsersWithActivity(): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_ALL_USERS_WITH_ACTIVITY,
      fetchPolicy: 'cache-and-network'
    }).valueChanges.pipe(
      map((result: any) => result)
    );
  }

  // New methods for analytics
  getAllUsers(): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_ALL_USERS_NATIONALITY,
      fetchPolicy: 'cache-and-network'
    }).valueChanges.pipe(
      map((result: any) => result)
    );
  }

  getAllUsersWithGender(): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_ALL_USERS_WITH_GENDER,
      fetchPolicy: 'cache-and-network'
    }).valueChanges.pipe(
      map((result: any) => result)
    );
  }
}