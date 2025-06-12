import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastComponent } from '../../layout/toast/toast.component';
import { ToastService } from '../../services/notification/toast.service';
import { Sentence } from '../../interfaces/sentence-interface/sentence';
import { SentencesService } from '../../services/sentences/sentences.service';

@Component({
  selector: 'app-sentences',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],
  templateUrl: './sentence.component.html',
  styleUrls: ['./sentence.component.css']
})
export class SentenceComponent implements OnInit {
  sentences: Sentence[] = [];
  showAddModal = false;
  selectedFile: File | null = null;
  selectedFileName = '';
  imagePreview = '';
  isEditMode = false;
  editingsentenceId: string | null = null;
  // New search and filter properties
  searchTerm: string = '';
  selectedLevelFilter: string = '';
  filteredsentences: Sentence[] = [];
  

  newsentence = {
    sentence: '',
    level: '' as 'Beginner' | 'Intermediate' | 'Advanced' | '',
    imageUrl: ''
  };

  constructor(private sentenceService: SentencesService, private toastService: ToastService) {}

  ngOnInit() {
    this.loadsentences();
  }

  loadsentences() {
    this.sentenceService.getSentences().subscribe({
      next: (data) => {
        this.sentences = data;
        this.filteredsentences = [...this.sentences]; // Initialize filtered sentences
        console.log('Loaded sentences:', this.sentences.map(w => ({id: w.id, sentence: w.sentence})));
      },
      error: (err) => {
        console.error('Failed to fetch sentences:', err);
      }
    });
  }

  // New search and filter methods
  onSearchChange(): void {
    this.applyFilters();
  }


  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.sentences];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(sentence => 
        sentence.sentence?.toLowerCase().includes(searchLower) ||
        sentence.sentence?.toLowerCase().startsWith(searchLower)
      );
    }

    // Apply level filter
    if (this.selectedLevelFilter) {
      filtered = filtered.filter(sentence => sentence.level === this.selectedLevelFilter);
    }

    this.filteredsentences = filtered;
  }


  getFilteredsentences(): Sentence[] {
    return this.filteredsentences;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedLevelFilter = '';
    this.applyFilters();
  }




  savesentences() {
    localStorage.setItem('sentences', JSON.stringify(this.sentences));
  }

  toggleAddModal() {
    this.showAddModal = !this.showAddModal;
    if (!this.showAddModal) {
      this.resetForm();
    }
  }


  getDisplaysentences(): Sentence[] {
    return this.getFilteredsentences();
  }




  getFilteredTotalsentences(): number {
    return this.getFilteredsentences().length;
  }


  closeModal(event: Event) {
    if (event.target === event.currentTarget) {
      this.toggleAddModal();
    }
  }

  onImageSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  hasValidImage(sentence: Sentence): boolean {
    return Boolean(sentence.imageUrl?.trim());
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const container = img.closest('.image-container');

    img.style.display = 'none';
    container?.classList.add('image-error');
  }

  openEditModal(sentence: Sentence) {
    this.isEditMode = true;
    this.editingsentenceId = sentence.id;
    this.newsentence = {
      sentence: sentence.sentence ?? '',
      level: sentence.level ?? '',
      imageUrl: sentence.imageUrl ?? ''
    };
    this.imagePreview = sentence.imageUrl ?? '';
    this.showAddModal = true;
  }


  // Update addsentence method to refresh filters after adding
  addsentence(): void {
    const { sentence, level } = this.newsentence;

    if (!sentence?.trim() || !level) {
      return;
    }

    if (this.isEditMode && this.editingsentenceId !== null) {
      const id = this.editingsentenceId;

      if (this.selectedFile) {
        this.sentenceService.updateViaHttpClient(id, sentence.trim(), level, this.selectedFile).subscribe({
          next: (response: any) => {
            const updated = response?.data?.updatesentence;
            if (updated) {
              const index = this.sentences.findIndex(w => w.id === updated.id);
              if (index !== -1) {
                this.sentences[index] = updated;
              }
              this.savesentences();
              this.toggleAddModal();
              this.resetForm();
              // Add this toast notification
              this.toastService.showSuccess('sentence Updated!', `"${updated.sentence}" has been successfully updated.`);
              this.loadsentences(); // ✅ Refresh the list from the server
            } else {
              console.error('No sentence returned from update:', response);
            }
          },
          error: err => {
            console.error('Error updating sentence via HttpClient:', err);
            // Add error toast
            this.toastService.showError('Update Failed', 'Failed to update the sentence. Please try again.');
          }
        });

      } else {
        this.sentenceService.updateSentence(id, sentence.trim(), level).subscribe({
          next: updated => {
            const index = this.sentences.findIndex(w => w.id === updated.id);
            this.sentences = [
              ...this.sentences.slice(0, index),
              updated,
              ...this.sentences.slice(index + 1)
            ];

            this.savesentences();
            this.toggleAddModal();
            this.resetForm();
            // Add this toast notification
            this.toastService.showSuccess('sentence Updated!', `"${updated.sentence}" has been successfully updated.`);
            this.loadsentences(); // ✅ Refresh the list from the server
          },
          error: err => {
            console.error('Error updating sentence:', err);
            // Add error toast
            this.toastService.showError('Update Failed', 'Failed to update the sentence. Please try again.');
          }
        });
      }
    } else {
      if (this.selectedFile) {
        this.sentenceService.uploadViaHttpClient(sentence.trim(), level, this.selectedFile).subscribe({
          next: (response: any) => {
            const newsentence = response?.data?.createsentence;
            if (newsentence) {
              this.sentences = [...this.sentences, newsentence];
              this.applyFilters();
              this.toggleAddModal();
              this.resetForm();
              // Add this toast notification
              this.toastService.showSuccess('sentence Added!', `"${newsentence.sentence}" has been successfully added to your collection.`);
              this.loadsentences(); // ✅ Refresh the list from the server
            } else {
              console.error('No sentence returned from upload:', response);
            }
          },
          error: err => {
            console.error('Error adding sentence via HttpClient:', err);
            // Add error toast
            this.toastService.showError('Add Failed', 'Failed to add the sentence. Please try again.');
          }
        });

      } else {
          this.sentenceService.addSentence(sentence.trim(), level).subscribe({
            next: newsentence => {
              if (newsentence) {
                this.sentences = [...this.sentences, newsentence];
                this.applyFilters();
                this.toggleAddModal();
                this.resetForm();
                this.toastService.showSuccess('sentence Added!', `"${newsentence.sentence}" has been successfully added to your collection.`);
                this.loadsentences(); // ✅ Refresh the list from the server
              } else {
                console.error('No sentence returned from Apollo mutation:', newsentence);
              }
            },
            error: err => {
              console.error('Error adding sentence via Apollo:', err);
              this.toastService.showError('Add Failed', 'Failed to add the sentence. Please try again.');
            }
          });

      }
    }
  }




  resetForm() {
    this.newsentence = {
      sentence: '',
      level: '',
      imageUrl: ''
    };
    this.selectedFile = null;
    this.selectedFileName = '';
    this.imagePreview = '';
    this.isEditMode = false;
    this.editingsentenceId = null;
  }

  deletesentence(id: string) {
    if (confirm('Are you sure you want to delete this sentence?')) {
      this.sentenceService.deleteSentence(id).subscribe({
        next: () => {
          this.toastService.showSuccess('sentence Deleted!', 'The sentence has been successfully deleted.');
          this.loadsentences(); // ✅ Refresh the list from the server
        },
        error: err => {
          console.error('Error deleting sentence:', err);
          this.toastService.showError('Delete Failed', 'Failed to delete the sentence. Please try again.');
        }
      });
    }
  }


  trackBysentence(index: number, sentence: Sentence): string {
    return sentence.id;
  }

  getTotalsentences(): number {
    return this.sentences.length;
  }

  getsentencesByLevel(level: string): number {
    return this.sentences.filter(sentence => sentence.level === level).length;
  }


  getFilteredsentencesByLevel(level: string): number {
    return this.getFilteredsentences().filter(sentence => sentence.level === level).length;
  }
}
