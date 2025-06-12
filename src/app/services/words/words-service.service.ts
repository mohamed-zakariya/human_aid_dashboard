import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {
  GET_WORDS,
  DELETE_WORD,
  UPDATE_WORD,
  ADD_WORD_MUTATION
} from '../../graphql/word-queries';

import { Word } from '../../interfaces/word-interface/word';

@Injectable({
  providedIn: 'root'
})
export class WordService {
  private graphqlUrl = 'http://localhost:5500/graphql';

  constructor(private apollo: Apollo, private http: HttpClient) {}

  getWords(): Observable<Word[]> {
    return this.apollo.watchQuery<{ getWords: Word[] }>({
      query: GET_WORDS
    }).valueChanges.pipe(
      map(result => result.data?.getWords ?? [])
    );
  }

  deleteWord(id: string): Observable<Word> {
    return this.apollo.mutate<{ deleteWord: Word }>({
      mutation: DELETE_WORD,
      variables: { id }
    }).pipe(
      map(result => result.data?.deleteWord as Word)
    );
  }

  updateWord(id: string, word: string, level: string, image?: File): Observable<Word> {
    return this.apollo.mutate<{ updateWord: Word }>({
      mutation: UPDATE_WORD,
      variables: { id, word, level, image }
    }).pipe(
      map(result => result.data?.updateWord as Word)
    );
  }

  addWord(word: string, level: string, image?: File): Observable<any> {
    return this.apollo.mutate<{ createWord: Word }>({
      mutation: ADD_WORD_MUTATION,
      variables: { word, level, image: image ?? null },
      context: { useMultipart: true }
    });
  }

  uploadViaHttpClient(word: string, level: string, file?: File): Observable<any> {
    const formData = new FormData();

    const operations = {
      query: `
        mutation ($word: String!, $level: String!, $image: Upload) {
          createWord(word: $word, level: $level, image: $image) {
            id
            word
            level
            imageUrl
          }
        }
      `,
      variables: { word, level, image: null }
    };

    formData.append('operations', JSON.stringify(operations));

    if (file) {
      const map = { '0': ['variables.image'] };
      formData.append('map', JSON.stringify(map));
      formData.append('0', file);
    }

    const headers = new HttpHeaders({ 'x-apollo-operation-name': 'createWord' });

    return this.http.post(this.graphqlUrl, formData, { headers });
  }

  updateViaHttpClient(id: string, word: string, level: string, file?: File): Observable<any> {
    const formData = new FormData();

    const operations = {
      query: `
        mutation ($id: ID!, $word: String, $level: String, $image: Upload) {
          updateWord(id: $id, word: $word, level: $level, image: $image) {
            id
            word
            level
            imageUrl
          }
        }
      `,
      variables: { id, word, level, image: null }
    };

    formData.append('operations', JSON.stringify(operations));

    if (file) {
      const map = { '0': ['variables.image'] };
      formData.append('map', JSON.stringify(map));
      formData.append('0', file);
    }

    const headers = new HttpHeaders({ 'x-apollo-operation-name': 'updateWord' });

    return this.http.post(this.graphqlUrl, formData, { headers });
  }
}
