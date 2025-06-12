export interface Word {
  id: string;
  word?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  imageUrl?: string;
}
