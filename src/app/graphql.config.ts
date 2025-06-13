// graphql.config.ts
import { Apollo } from 'apollo-angular';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { provideHttpClient } from '@angular/common/http';
import { createUploadLink } from 'apollo-upload-client';
import { setContext } from '@apollo/client/link/context';

// https://human-aid-deployment.onrender.com/graphql
// http://10.0.2.2:5500/graphql

export function createApollo() {
  // Create upload link to GraphQL server
  const uploadLink = createUploadLink({
    uri: 'https://human-aid-deployment.onrender.com/graphql',
  });

  // Middleware to add Authorization header with token
  const authLink = setContext(() => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  // Combine authLink and uploadLink
  const link = ApolloLink.from([authLink, uploadLink]);

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
    deps: [],
  },
];
