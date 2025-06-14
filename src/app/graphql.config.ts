// graphql.config.ts
import { Apollo } from 'apollo-angular';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { provideHttpClient } from '@angular/common/http';
import { createUploadLink } from 'apollo-upload-client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { Router } from '@angular/router';
import { NgZone } from '@angular/core';

// localhost:5500
// human-aid-deployment.onrender.com

export function createApollo(router: Router, ngZone: NgZone) {
  const uploadLink = createUploadLink({
    uri: 'https://human-aid-deployment.onrender.com/graphql',
  });

  const authLink = setContext(() => {
    const token = localStorage.getItem('token');
    console.log("entered");
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  const errorLink = onError(({ graphQLErrors, networkError, response, operation }) => {
    console.log("entereddd");

    if (graphQLErrors) {
      console.log("entereddddd - GraphQL Errors", graphQLErrors);
      for (const err of graphQLErrors) {
        if (err.extensions?.['code'] === 'UNAUTHENTICATED') {
          localStorage.removeItem('token');
          ngZone.run(() => router.navigate(['/login']));
        }
      }
    }

    if (networkError) {
      console.log("Network Error", networkError);

      const status = (networkError as any).status || (networkError as any).response?.status;
      if (status === 401) {
        localStorage.removeItem('token');
        ngZone.run(() => router.navigate(['/login']));
      }
    }
  });


  const link = ApolloLink.from([errorLink, authLink, uploadLink]);

  return {
    link,
    cache: new InMemoryCache(),
  };
}

export const graphqlProviders = [
  provideHttpClient(),
  Apollo,
  {
    provide: APOLLO_OPTIONS,
    useFactory: createApollo,
    deps: [Router, NgZone], // Inject the router for navigation
  },
];
