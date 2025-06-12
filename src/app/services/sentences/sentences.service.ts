import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import {
  GET_SENTENCES,
  CREATE_SENTENCE,
  UPDATE_SENTENCE,
  DELETE_SENTENCE
} from '../../graphql/sentence-queries';

import { Sentence } from '../../interfaces/sentence-interface/sentence';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SentencesService {







  constructor(private apollo: Apollo, private http: HttpClient) {}

    private graphqlUrl = 'http://localhost:5500/graphql';


  getSentences(): Observable<Sentence[]> {
    return this.apollo.watchQuery<{ getSentences: Sentence[] }>({
      query: GET_SENTENCES
    }).valueChanges.pipe(
      map(result => result.data?.getSentences ?? [])
    );
  }

  createSentence(sentence: string, level: string): Observable<Sentence> {
    return this.apollo.mutate<{ createSentence: Sentence }>({
      mutation: CREATE_SENTENCE,
      variables: { sentence, level }
    }).pipe(
      map(result => result.data?.createSentence as Sentence)
    );
  }

  updateSentence(id: string, sentence: string, level: string): Observable<Sentence> {
    return this.apollo.mutate<{ updateSentence: Sentence }>({
      mutation: UPDATE_SENTENCE,
      variables: { id, sentence, level }
    }).pipe(
      map(result => result.data?.updateSentence as Sentence)
    );
  }

  deleteSentence(id: string): Observable<Sentence> {
    return this.apollo.mutate<{ deleteSentence: Sentence }>({
      mutation: DELETE_SENTENCE,
      variables: { id }
    }).pipe(
      map(result => result.data?.deleteSentence as Sentence)
    );
  }



  addSentence(sentence: string, level: string): Observable<Sentence> {
    return this.apollo.mutate<{ createSentence: Sentence }>({
      mutation: CREATE_SENTENCE,
      variables: { sentence, level }
    }).pipe(
      map(result => result.data?.createSentence as Sentence)
    );
  }


uploadViaHttpClient(sentence: string, level: string, file?: File): Observable<any> {
  const formData = new FormData();

  const operations = {
    query: `
      mutation ($sentence: String!, $level: String!, $image: Upload) {
        createSentence(sentence: $sentence, level: $level, image: $image) {
          id
          sentence
          level
          imageUrl
        }
      }
    `,
    variables: { sentence, level, image: null }
  };

  formData.append('operations', JSON.stringify(operations));

  if (file) {
    const map = { '0': ['variables.image'] };
    formData.append('map', JSON.stringify(map));
    formData.append('0', file);
  }

  const headers = new HttpHeaders({ 'x-apollo-operation-name': 'createSentence' });

  return this.http.post(this.graphqlUrl, formData, { headers });
}

updateViaHttpClient(id: string, sentence: string, level: string, file?: File): Observable<any> {
  const formData = new FormData();

  const operations = {
    query: `
      mutation ($id: ID!, $sentence: String, $level: String, $image: Upload) {
        updateSentence(id: $id, sentence: $sentence, level: $level, image: $image) {
          id
          sentence
          level
          imageUrl
        }
      }
    `,
    variables: { id, sentence, level, image: null }
  };

  formData.append('operations', JSON.stringify(operations));

  if (file) {
    const map = { '0': ['variables.image'] };
    formData.append('map', JSON.stringify(map));
    formData.append('0', file);
  }

  const headers = new HttpHeaders({ 'x-apollo-operation-name': 'updateSentence' });

  return this.http.post(this.graphqlUrl, formData, { headers });
}




}
