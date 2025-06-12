export interface Sentence {
    data: any;
    id: string;
    sentence?: string;
    level?: 'Beginner' | 'Intermediate' | 'Advanced';
    imageUrl?: string;
}
