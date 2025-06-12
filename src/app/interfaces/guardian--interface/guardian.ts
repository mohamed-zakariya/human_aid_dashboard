export interface Guardian {
  id: string;
  name: string;
  gender: string;
  email: string;
  nationality: string;
  phoneNumber: string;
  birthdate: string;
  linkedChildren: { username: string }[];
  lastActive?: string;
}

export interface GuardianResponse {
  getAllParentsWithChildren: {
    name: string;
    gender: string;
    email: string;
    nationality: string;
    phoneNumber: string;
    birthdate: string;
    linkedChildren: { username: string }[];
  }[];
}
