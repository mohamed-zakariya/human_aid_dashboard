export interface Learner {
  id: string;
  name: string;
  username?: string;
  email?: string;
  role?: 'adult' | 'child';
  gender?: 'male' | 'female';
  birthdate: string;
  nationality?: string;
  lastActiveDate: string;
  age?: number;
  lastActive?: string;
}