// app.config.ts
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { graphqlProviders } from './graphql.config';

export const appConfig = {
  providers: [
    provideRouter(routes),
    ...graphqlProviders,
  ],
};
