// graphql.config.ts
import { Apollo } from 'apollo-angular';
import { InMemoryCache } from '@apollo/client/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { provideHttpClient } from '@angular/common/http';
import { createUploadLink } from 'apollo-upload-client';

export function createApollo() {
  const uploadLink = createUploadLink({
    uri: 'https://human-aid-deployment.onrender.com/graphql',
  });

  return {
    link: uploadLink,
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
