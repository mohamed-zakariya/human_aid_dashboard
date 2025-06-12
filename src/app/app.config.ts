import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { graphqlProviders } from './graphql.config';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

export const appConfig = {
  providers: [
    provideRouter(routes),
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    ...graphqlProviders,
  ],
};
