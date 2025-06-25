import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Learner } from '../../interfaces/learner-interface/learner';
import { DELETE_USER, GET_ALL_USERS, sendInactiviteEmail } from '../../graphql/learners-queries';


@Injectable({
  providedIn: 'root'
})
export class LearnersService {
  constructor(private apollo: Apollo) {}

  getAllUsers(): Observable<Learner[]> {
    return this.apollo.watchQuery<{ getAllUsers: Learner[] }>({
      query: GET_ALL_USERS
    }).valueChanges.pipe(
      map(result => result.data.getAllUsers)
    );
  }


  deleteUser(userId: string): Observable<boolean> {
    return this.apollo.mutate<{ deleteUser: boolean }>({
      mutation: DELETE_USER,
      variables: { userId }
    }).pipe(map(result => result.data?.deleteUser ?? false));
  }

  sendInactivityEmail(userId: string, parentId?: string): Observable<{ message: string; success: boolean }> {
    return this.apollo.mutate<{
      sendInactivityEmailToUser: { message: string; success: boolean }
    }>({
      mutation: sendInactiviteEmail,
      variables: {
        userId,
        parentId: parentId ?? null
      }
    }).pipe(
      map(result => result.data?.sendInactivityEmailToUser!)
    );
  }

}
