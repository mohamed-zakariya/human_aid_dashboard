// learners.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Learner } from '../../interfaces/learner-interface/learner';
import { LearnersService } from '../../services/learners/learners.service';
import { ToastService } from '../../services/notification/toast.service';
import { ToastComponent } from '../../layout/toast/toast.component';

@Component({
  selector: 'app-learners',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ToastComponent],
  templateUrl: './learners.component.html',
  styleUrls: [`./learners.component.css`]
})
export class LearnersComponent implements OnInit {
  isDarkMode = false;
  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  currentLearner: Learner | null = null;

  // Add these properties to your component class
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  paginatedLearners: Learner[] = [];
  learners: Learner[] = [];
  Math = Math;

  
  filteredLearners: Learner[] = [];
  
  filters = {
    search: '',
    role: '',
    gender: '',
    ageMin: null as number | null,
    ageMax: null as number | null,
    lastActive: ''
  };

  learnerForm: FormGroup;
  loading: boolean = false;
  error: string = '';

  constructor(private fb: FormBuilder, private learnersService: LearnersService, private toastService: ToastService) {
    this.learnerForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      gender: ['', Validators.required],
      birthdate: ['', Validators.required],
      nationality: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.isDarkMode = document.body.classList.contains('dark-mode');
    this.loadLearners(); // Call the new method
  }




  processLearners() {
    this.learners = this.learners.map(learner => ({
      ...learner,
      age: this.calculateAge(learner.birthdate),
      lastActive: this.formatLastActive(learner.lastActiveDate)
    }));

    this.updatePagination();
  }

  calculateAge(birthdate: string): number {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  }



  // Add this method to calculate pagination
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredLearners.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedLearners = this.filteredLearners.slice(startIndex, endIndex);
  }


    loadLearners(): void {
    this.loading = true;
    this.error = '';
    
    this.learnersService.getAllUsers().subscribe({
      next: (learners: Learner[]) => {
        this.learners = learners;
        this.processLearners();
        this.applyFilters();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading learners:', error);
        this.error = 'Failed to load learners. Please try again.';
        this.loading = false;
      }
    });
  }


  formatLastActive(timestamp: string): string {
    const date = new Date(parseInt(timestamp));
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  }

  getLastActiveClass(timestamp: string): string {
    const date = new Date(parseInt(timestamp));
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'active';
    if (diffDays <= 7) return 'recent';
    return 'inactive';
  }

  isInactive(timestamp: string): boolean {
    const date = new Date(parseInt(timestamp));
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30;
  }

  applyFilters() {

    this.filteredLearners = this.learners.filter(learner => {
      // Search filter
      if (this.filters.search && !learner.name.toLowerCase().includes(this.filters.search.toLowerCase())) {
        return false;
      }
      
      // Role filter
      if (this.filters.role && learner.role !== this.filters.role) {
        return false;
      }
      
      // Gender filter
      if (this.filters.gender && learner.gender !== this.filters.gender) {
        return false;
      }
      
      // Age range filter
      if (this.filters.ageMin !== null && learner.age! < this.filters.ageMin) {
        return false;
      }
      if (this.filters.ageMax !== null && learner.age! > this.filters.ageMax) {
        return false;
      }
      
      // Last active filter
      if (this.filters.lastActive) {
        const date = new Date(parseInt(learner.lastActiveDate));
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (this.filters.lastActive) {
          case 'today':
            if (diffDays > 1) return false;
            break;
          case 'week':
            if (diffDays > 7) return false;
            break;
          case 'month':
            if (diffDays > 30) return false;
            break;
          case 'inactive':
            if (diffDays <= 30) return false;
            break;
        }
      }
      
      return true;
    });

    this.currentPage = 1; // Reset to first page when filters change
    this.updatePagination();
  }

  clearFilters() {
    this.filters = {
      search: '',
      role: '',
      gender: '',
      ageMin: null,
      ageMax: null,
      lastActive: ''
    };
    this.applyFilters();
  }

  openModal(mode: 'add' | 'edit', learner?: Learner) {
    this.modalMode = mode;
    this.currentLearner = learner || null;
    this.showModal = true;
    
    if (mode === 'edit' && learner) {
      // Convert birthdate back to YYYY-MM-DD format for the date input
      const date = new Date(learner.birthdate);
      const formattedDate = date.toISOString().split('T')[0];
      
      this.learnerForm.patchValue({
        name: learner.name,
        username: learner.username,
        email: learner.email,
        role: learner.role,
        gender: learner.gender,
        birthdate: formattedDate,
        nationality: learner.nationality
      });
    } else {
      this.learnerForm.reset();
    }
  }

  closeModal() {
    this.showModal = false;
    this.currentLearner = null;
    this.learnerForm.reset();
  }

  saveLearner() {
    if (this.learnerForm.valid) {
      const formValue = this.learnerForm.value;
      const newLearner: Learner = {
        ...formValue,
        id: this.modalMode === 'add' ? this.generateId() : this.currentLearner?.id,
        birthdate: new Date(formValue.birthdate).toISOString(),
        lastActiveDate: this.modalMode === 'add' ? Date.now().toString() : this.currentLearner?.lastActiveDate || Date.now().toString()
      };

      if (this.modalMode === 'add') {
        this.learners.push(newLearner);
      } else {
        const index = this.learners.findIndex(l => l.id === this.currentLearner?.id);
        if (index !== -1) {
          this.learners[index] = newLearner;
        }
      }

      this.processLearners();
      this.applyFilters();
      this.closeModal();
    }
  }

  deleteLearner(learner: Learner) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.loading = true;
      const userId = learner.id
      this.learnersService.deleteUser(userId).subscribe({
        next: success => {
          if (success) {
            this.learners = this.learners.filter(l => l.id !== userId);
            this.processLearners();
            this.applyFilters();
            this.toastService.showSuccess('User Deleted!', `"${learner.name}" has been successfully deleted.`);
          } else {
            alert('User could not be deleted.');
          }
          this.loading = false;
        },
        error: err => {
          console.error('Delete failed:', err);
          alert('An error occurred.');
        }
      });
    }
  }


  generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  trackByLearner(index: number, learner: Learner): string {
    return learner.id || index.toString();
  }

  // Add pagination navigation methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }



}