// auth.service.ts
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../interfaces/user-interface/user';

const LOGIN_MUTATION = gql`
  mutation($username: String!, $password: String!) {
    loginAdmin(username: $username, password: $password) {
      user {
        id
        name
        gender
        username
        email
      }
      accessToken
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apollo: Apollo) {}

  login(username: string, password: string): Observable<User> {
    return this.apollo.mutate({
      mutation: LOGIN_MUTATION,
      variables: { username, password }
    }).pipe(
      map((result: any) => {
        const token = result?.data?.loginAdmin?.accessToken;
        const user = result?.data?.loginAdmin?.user;

        if (token && user) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }

        return user;
      })
    );
  }

  getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
}
