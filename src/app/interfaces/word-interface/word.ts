export interface Word {
  id: string;
  word?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  synonym?: string;  // Added synonym field
  imageUrl?: string;
}