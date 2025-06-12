import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/notification/toast.service';
import { ToastComponent } from '../../layout/toast/toast.component';
import { Guardian } from '../../interfaces/guardian--interface/guardian';
import { GuardianService } from '../../services/quardian/quardian.service';

@Component({
  selector: 'app-guardian-management',
  imports: [CommonModule, FormsModule, ToastComponent],
  templateUrl: './guardian-management.component.html',
  styleUrls: ['./guardian-management.component.css']
})
export class GuardianManagementComponent implements OnInit {
  guardians: Guardian[] = [];
  filteredGuardians: Guardian[] = [];
  loading: boolean = false;
  error: string = '';
  
  // Filter properties
  searchName: string = '';
  selectedGender: string = 'All';
  selectedNationality: string = 'All';
  minChildren: number = 0;
  maxChildren: number = 20;
  selectedLastActive: string = 'All';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  
  // Dropdown options
  genderOptions: string[] = ['All', 'male', 'female'];
  nationalityOptions: string[] = [];
  lastActiveOptions: string[] = ['All', 'Last week', 'Last month', '3 months ago', '6 months ago', 'More than 6 months'];

  constructor(private guardianService: GuardianService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.loadGuardians();
  }

  loadGuardians(): void {
    this.loading = true;
    this.error = '';
    
    this.guardianService.getAllGuardians().subscribe({
      next: (guardians: Guardian[]) => {
        this.guardians = guardians;
        this.extractNationalityOptions();
        this.applyFilters();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading guardians:', error);
        this.error = 'Failed to load guardians. Please try again.';
        this.loading = false;
        // Fallback to mock data for development
        this.loadMockData();
      }
    });
  }

  private loadMockData(): void {
    // Mock data for development/testing
    this.guardians = [
      {
        id: '1',
        name: 'Ahmed Hassan',
        gender: 'Male',
        email: 'ahmed.hassan@email.com',
        nationality: 'Egyptian',
        phoneNumber: '+20123456789',
        birthdate: '1985-05-15',
        linkedChildren: [
          { username: 'sara_ahmed' },
          { username: 'omar_ahmed' },
          { username: 'nour_ahmed' }
        ],
        lastActive: '2 weeks ago'
      },
      {
        id: '2',
        name: 'Fatima Al-Zahra',
        gender: 'Female',
        email: 'fatima.alzahra@email.com',
        nationality: 'Saudi Arabian',
        phoneNumber: '+966123456789',
        birthdate: '1990-08-22',
        linkedChildren: [
          { username: 'ali_fatima' },
          { username: 'zahra_fatima' }
        ],
        lastActive: '1 month ago'
      },
      {
        id: '3',
        name: 'Mohammed Ibrahim',
        gender: 'Male',
        email: 'mohammed.ibrahim@email.com',
        nationality: 'Moroccan',
        phoneNumber: '+212123456789',
        birthdate: '1982-12-10',
        linkedChildren: [
          { username: 'youssef_mohammed' },
          { username: 'amina_mohammed' },
          { username: 'hassan_mohammed' },
          { username: 'khadija_mohammed' },
          { username: 'ibrahim_mohammed' }
        ],
        lastActive: '3 days ago'
      }
    ];
    
    this.extractNationalityOptions();
    this.applyFilters();
  }

  extractNationalityOptions(): void {
    this.nationalityOptions = ['All', ...this.guardianService.getUniqueNationalities(this.guardians)];
  }

  applyFilters(): void {
    this.filteredGuardians = this.guardianService.filterGuardians(this.guardians, {
      searchName: this.searchName,
      gender: this.selectedGender,
      nationality: this.selectedNationality,
      minChildren: this.minChildren,
      maxChildren: this.maxChildren,
      lastActive: this.selectedLastActive
    });
    
    this.totalItems = this.filteredGuardians.length;
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchName = '';
    this.selectedGender = 'All';
    this.selectedNationality = 'All';
    this.minChildren = 0;
    this.maxChildren = 0;
    this.selectedLastActive = 'All';
    this.applyFilters();
  }

  get paginatedGuardians(): Guardian[] {
    return this.guardianService.paginateResults(this.filteredGuardians, this.currentPage, this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get displayedRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start} to ${end} of ${this.totalItems}`;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  calculateAge(birthdate: string): number {
    return this.guardianService.calculateAge(birthdate);
  }

  getInitials(name: string): string {
    return this.guardianService.getInitials(name);
  }

  editGuardian(guardian: Guardian): void {
    console.log('Edit guardian:', guardian);
    // Implement edit functionality - you can open a modal or navigate to edit page
    // Example:
    // this.router.navigate(['/guardians/edit', guardian.id]);
  }

  deleteGuardian(guardian: Guardian): void {
    if (confirm(`Are you sure you want to delete ${guardian.name}? This action cannot be undone.`)) {
      this.loading = true;

      this.guardianService.deleteGuardian(guardian.id).subscribe({
        next: (success) => {
          if (success) {
            this.guardians = this.guardians.filter(g => g.id !== guardian.id);
            this.applyFilters();
            this.toastService.showSuccess('Guardian Deleted', `"${guardian.name}" has been successfully removed.`);
          } else {
            this.toastService.showError('Delete Failed', 'Could not delete the guardian.');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting guardian:', error);
          this.toastService.showError('Error', 'An error occurred while deleting the guardian.');
          this.loading = false;
        }
      });
    }
  }


  addGuardian(): void {
    console.log('Add new guardian');
    // Implement add guardian functionality
    // Example:
    // this.router.navigate(['/guardians/create']);
  }

  toggleChildrenView(event: Event): void {
    const button = event.target as HTMLButtonElement;
    const childrenList = button.parentElement;
    const hiddenChildren = childrenList?.querySelectorAll('.child-tag.show-more');
    
    if (hiddenChildren) {
      hiddenChildren.forEach((child: Element) => {
        const htmlChild = child as HTMLElement;
        if (htmlChild.style.display === 'none') {
          htmlChild.style.display = 'inline-block';
          button.textContent = 'Show less';
        } else {
          htmlChild.style.display = 'none';
          const totalHidden = hiddenChildren.length;
          button.textContent = `+${totalHidden} more`;
        }
      });
    }
  }
}