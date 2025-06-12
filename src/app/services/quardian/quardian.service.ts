import { Injectable } from '@angular/core';
import { Apollo} from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Guardian, GuardianResponse } from '../../interfaces/guardian--interface/guardian';
import { DELETE_GUARDIAN, GET_ALL_GUARDIANS } from '../../graphql/guardians-queries';


@Injectable({
  providedIn: 'root'
})
export class GuardianService {
  // This depends on how you store/calculate last active dates
  // deleteGuardian(id: string) {
  //   throw new Error('Method not implemented.');
  // }

  constructor(private apollo: Apollo) {}

  // GraphQL Query


  /**
   * Fetch all guardians with their linked children
   */
  getAllGuardians(): Observable<Guardian[]> {
    return this.apollo.watchQuery<GuardianResponse>({
      query: GET_ALL_GUARDIANS,
      fetchPolicy: 'cache-and-network'
    }).valueChanges.pipe(
      map(result => {
        if (result.data?.getAllParentsWithChildren) {
          return result.data.getAllParentsWithChildren.map((guardian, index) => ({
            id: `guardian_${index + 1}`, // Generate ID if not provided by API
            ...guardian,
            lastActive: this.generateRandomLastActive() // You can remove this if provided by API
          }));
        }
        return [];
      })
    );
  }

  /**
   * Update a guardian's information
   */
  // updateGuardian(id: string, guardianData: Partial<Guardian>): Observable<Guardian> {
  //   return this.apollo.mutate({
  //     mutation: this.UPDATE_GUARDIAN,
  //     variables: {
  //       id: id,
  //       input: {
  //         name: guardianData.name,
  //         gender: guardianData.gender,
  //         email: guardianData.email,
  //         nationality: guardianData.nationality,
  //         phoneNumber: guardianData.phoneNumber,
  //         birthdate: guardianData.birthdate
  //       }
  //     },
  //     refetchQueries: [{ query: this.GET_ALL_GUARDIANS }]
  //   }).pipe(
  //     map(result => result.data?.updateParent)
  //   );
  // }

  /**
   * Delete a guardian
   */
  deleteGuardian(id: string): Observable<boolean> {
    return this.apollo.mutate<{ deleteParentAndChildren: boolean }>({
      mutation: DELETE_GUARDIAN,
      variables: { parentId: id },
      refetchQueries: [{ query: GET_ALL_GUARDIANS }]
    }).pipe(
      map(result => result.data?.deleteParentAndChildren ?? false)
    );
  }



  /**
   * Create a new guardian
   */
  // createGuardian(guardianData: Omit<Guardian, 'id' | 'linkedChildren' | 'lastActive'>): Observable<Guardian> {
  //   return this.apollo.mutate({
  //     mutation: this.CREATE_GUARDIAN,
  //     variables: {
  //       input: guardianData
  //     },
  //     refetchQueries: [{ query: this.GET_ALL_GUARDIANS }]
  //   }).pipe(
  //     map(result => result.data?.createParent)
  //   );
  // }

  /**
   * Filter guardians based on criteria
   */
  filterGuardians(
    guardians: Guardian[],
    filters: {
      searchName?: string;
      gender?: string;
      nationality?: string;
      minChildren?: number;
      maxChildren?: number;
      lastActive?: string;
    }
  ): Guardian[] {
    return guardians.filter(guardian => {
      // Name search
      if (filters.searchName && !guardian.name.toLowerCase().includes(filters.searchName.toLowerCase())) {
        return false;
      }

      // Gender filter
      if (filters.gender && filters.gender !== 'All' && guardian.gender !== filters.gender) {
        return false;
      }

      // Nationality filter
      if (filters.nationality && filters.nationality !== 'All' && guardian.nationality !== filters.nationality) {
        return false;
      }

      // Children count filters
      const childrenCount = guardian.linkedChildren.length;
      if (filters.minChildren !== undefined && childrenCount < filters.minChildren) {
        return false;
      }
      if (filters.maxChildren !== undefined && childrenCount > filters.maxChildren) {
        return false;
      }

      // Last active filter (implement based on your requirements)
      if (filters.lastActive && filters.lastActive !== 'All') {
        // Add logic to filter by last active period
        // This depends on how you store/calculate last active dates
      }

      return true;
    });
  }

  /**
   * Calculate age from birthdate
   */
  calculateAge(birthdate: string): number {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Get initials from name
   */
  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  /**
   * Generate random last active (remove this when you have real data)
   */
  private generateRandomLastActive(): string {
    const options = ['3 days ago', '1 week ago', '2 weeks ago', '1 month ago', '2 months ago', '3 months ago'];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Paginate results
   */
  paginateResults<T>(items: T[], page: number, itemsPerPage: number): T[] {
    const startIndex = (page - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }

  /**
   * Get unique nationalities from guardians list
   */
  getUniqueNationalities(guardians: Guardian[]): string[] {
    const nationalities = [...new Set(guardians.map(g => g.nationality))];
    return nationalities.sort();
  }
}

