import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import {
  GET_STORIES,
  CREATE_STORY,
  UPDATE_STORY,
  DELETE_STORY
} from '../../graphql/story-queries';

import { Story } from '../../interfaces/story-interface/story';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  
  constructor(private apollo: Apollo) {}

  getStories(): Observable<Story[]> {
    return this.apollo.watchQuery<{ getStories: Story[] }>({
      query: GET_STORIES
    }).valueChanges.pipe(
      map(result => result.data?.getStories ?? [])
    );
  }

  createStory(
    story: string,
    kind: string,
    summary: string | null,
    morale: string
  ): Observable<any> {
    return this.apollo.mutate<{ createStory: Story }>({
      mutation: CREATE_STORY,
      variables: { story, kind, summary, morale }
    });
  }

  updateStory(
    id: string,
    story: string,
    kind: string,
    summary: string | null,
    morale: string | null
  ): Observable<Story> {
    return this.apollo.mutate<{ updateStory: Story }>({
      mutation: UPDATE_STORY,
      variables: { id, story, kind, summary, morale }
    }).pipe(
      map(result => result.data?.updateStory as Story)
    );
  }


  deleteStory(id: string): Observable<Story> {
    return this.apollo.mutate<{ deleteStory: Story }>({
      mutation: DELETE_STORY,
      variables: { id }
    }).pipe(
      map(result => result.data?.deleteStory as Story)
    );
  }
}