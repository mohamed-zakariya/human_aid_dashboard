// graphql.config.ts
import { Apollo } from 'apollo-angular';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { provideHttpClient } from '@angular/common/http';
import { createUploadLink } from 'apollo-upload-client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { Router } from '@angular/router';

export function createApollo(router: Router) {
  const uploadLink = createUploadLink({
    uri: 'https://human-aid-deployment.onrender.com/graphql',
  });

  const authLink = setContext(() => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        if (err.extensions?.['code'] === 'UNAUTHENTICATED') {
          localStorage.removeItem('token');
          router.navigate(['/login']);
        }
      }
    }

    if (networkError && (networkError as any).status === 401) {
      localStorage.removeItem('token');
      router.navigate(['/login']);
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
    deps: [Router], // Inject the router for navigation
  },
];
