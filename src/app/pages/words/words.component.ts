import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WordService } from '../../services/words/words-service.service';
import { Word } from '../../interfaces/word-interface/word';
import { ToastComponent } from '../../layout/toast/toast.component';
import { ToastService } from '../../services/notification/toast.service';

@Component({
  selector: 'app-words',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],
  templateUrl: './words.component.html',
  styleUrls: ['./words.component.css']
})
export class WordsComponent implements OnInit {
  words: Word[] = [];
  showAddModal = false;
  selectedFile: File | null = null;
  selectedFileName = '';
  imagePreview = '';
  isEditMode = false;
  editingWordId: string | null = null;
  
  // Search and filter properties
  searchTerm: string = '';
  selectedLevelFilter: string = '';
  filteredWords: Word[] = [];

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  paginatedWords: Word[] = [];
  
  // Pagination display options
  itemsPerPageOptions: number[] = [5, 10, 15, 20, 25, 50];
  maxVisiblePages: number = 5;

  loading: boolean = false;
  error: string = '';

  newWord = {
    word: '',
    level: '' as 'Beginner' | 'Intermediate' | 'Advanced' | '',
    synonym: '',
    imageUrl: ''
  };

  constructor(private wordService: WordService, private toastService: ToastService) {}

  ngOnInit() {
    this.loadWords();
  }

  loadWords() {
    this.loading = true;
    this.error = '';
    this.wordService.getWords().subscribe({
      next: (data) => {
        this.words = data;
        this.filteredWords = [...this.words];
        this.applyPagination();
        console.log('Loaded words:', this.words.map(w => ({id: w.id, word: w.word})));
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch words:', err);
        this.error = 'Failed to fetch words. Please try again.';
        this.loading = false;
      }
    });
  }

  // Enhanced search and filter methods
  onSearchChange(): void {
    this.currentPage = 1; // Reset to first page when searching
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1; // Reset to first page when filtering
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.words];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(word => 
        word.word?.toLowerCase().includes(searchLower) ||
        word.word?.toLowerCase().startsWith(searchLower) ||
        word.synonym?.toLowerCase().includes(searchLower) ||
        word.synonym?.toLowerCase().startsWith(searchLower)
      );
    }

    // Apply level filter
    if (this.selectedLevelFilter) {
      filtered = filtered.filter(word => word.level === this.selectedLevelFilter);
    }

    this.filteredWords = filtered;
    this.applyPagination();
  }

  // Pagination methods
  applyPagination(): void {
    this.totalPages = Math.ceil(this.filteredWords.length / this.itemsPerPage);
    
    // Ensure current page is within bounds
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedWords = this.filteredWords.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyPagination();
    }
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1; // Reset to first page
    this.applyPagination();
  }

  goToFirstPage(): void {
    this.onPageChange(1);
  }

  goToLastPage(): void {
    this.onPageChange(this.totalPages);
  }

  goToPreviousPage(): void {
    this.onPageChange(this.currentPage - 1);
  }

  goToNextPage(): void {
    this.onPageChange(this.currentPage + 1);
  }

  getVisiblePageNumbers(): number[] {
    const pages: number[] = [];
    const half = Math.floor(this.maxVisiblePages / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < this.maxVisiblePages) {
      start = Math.max(1, end - this.maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  getPaginationInfo(): string {
    if (this.filteredWords.length === 0) {
      return 'No items to display';
    }

    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredWords.length);
    const total = this.filteredWords.length;

    return `Showing ${start}-${end} of ${total} words`;
  }

  getFilteredWords(): Word[] {
    return this.paginatedWords; // Return paginated words instead of all filtered words
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedLevelFilter = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  saveWords() {
    localStorage.setItem('words', JSON.stringify(this.words));
  }

  toggleAddModal() {
    this.showAddModal = !this.showAddModal;
    if (!this.showAddModal) {
      this.resetForm();
    }
  }

  getDisplayWords(): Word[] {
    return this.getFilteredWords();
  }

  getFilteredTotalWords(): number {
    return this.filteredWords.length; // Return total filtered count, not paginated count
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

  hasValidImage(word: Word): boolean {
    return Boolean(word.imageUrl?.trim());
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const container = img.closest('.image-container');

    img.style.display = 'none';
    container?.classList.add('image-error');
  }

  openEditModal(word: Word) {
    this.isEditMode = true;
    this.editingWordId = word.id;
    this.newWord = {
      word: word.word ?? '',
      level: word.level ?? '',
      synonym: word.synonym ?? '',
      imageUrl: word.imageUrl ?? ''
    };
    this.imagePreview = word.imageUrl ?? '';
    this.showAddModal = true;
  }

  addWord(): void {
    const { word, level, synonym } = this.newWord;

    if (!word?.trim() || !level) {
      return;
    }

    if (this.isEditMode && this.editingWordId !== null) {
      const id = this.editingWordId;

      if (this.selectedFile) {
        this.loading = true;
        this.wordService.updateViaHttpClient(id, word.trim(), level, synonym?.trim(), this.selectedFile).subscribe({
          next: (response: any) => {
            const updated = response?.data?.updateWord;
            if (updated) {
              const index = this.words.findIndex(w => w.id === updated.id);
              this.words = [
                ...this.words.slice(0, index),
                updated,
                ...this.words.slice(index + 1)
              ];
              this.saveWords();
              this.toggleAddModal();
              this.resetForm();
              this.toastService.showSuccess('Word Updated!', `"${updated.word}" has been successfully updated.`);
              this.loadWords();
              window.location.reload();
              this.loading = false;
            } else {
              console.error('No word returned from update:', response);
              this.loading = false;
            }
          },
          error: err => {
            console.error('Error updating word via HttpClient:', err);
            this.toastService.showError('Update Failed', 'Failed to update the word. Please try again.');
          }
        });

      } else {
        this.loading = true;
        this.wordService.updateWord(id, word.trim(), level, synonym?.trim()).subscribe({
          next: updated => {
            const index = this.words.findIndex(w => w.id === updated.id);
            this.words = [
              ...this.words.slice(0, index),
              updated,
              ...this.words.slice(index + 1)
            ];
            this.saveWords();
            this.toggleAddModal();
            this.resetForm();
            this.toastService.showSuccess('Word Updated!', `"${updated.word}" has been successfully updated.`);
            this.loadWords();
            window.location.reload();
            this.loading = false;
          },
          error: err => {
            console.error('Error updating word:', err);
            this.toastService.showError('Update Failed', 'Failed to update the word. Please try again.');
            this.loading = false;
          }
        });
      }
    } else {
      if (this.selectedFile) {
        this.wordService.uploadViaHttpClient(word.trim(), level, synonym?.trim(), this.selectedFile).subscribe({
          next: (response: any) => {
            const newWord = response?.data?.createWord;
            if (newWord) {
              this.words = [...this.words, newWord];
              this.applyFilters(); // This will also apply pagination
              this.toggleAddModal();
              this.resetForm();
              this.toastService.showSuccess('Word Added!', `"${newWord.word}" has been successfully added to your collection.`);
              this.loadWords();
              window.location.reload();
            } else {
              console.error('No word returned from upload:', response);
            }
          },
          error: err => {
            console.error('Error adding word via HttpClient:', err);
            this.toastService.showError('Add Failed', 'Failed to add the word. Please try again.');
          }
        });

      } else {
        this.wordService.addWord(word.trim(), level, synonym?.trim()).subscribe({
          next: result => {
            const newWord = result.data?.createWord;
            if (newWord) {
              this.words = [...this.words, newWord];
              this.applyFilters(); // This will also apply pagination
              this.toggleAddModal();
              this.resetForm();
              this.toastService.showSuccess('Word Added!', `"${newWord.word}" has been successfully added to your collection.`);
              this.loadWords();
            } else {
              console.error('No word returned from Apollo mutation:', result);
            }
          },
          error: err => {
            console.error('Error adding word via Apollo:', err);
            this.toastService.showError('Add Failed', 'Failed to add the word. Please try again.');
          }
        });
      }
    }
  }

  resetForm() {
    this.newWord = {
      word: '',
      level: '',
      synonym: '',
      imageUrl: ''
    };
    this.selectedFile = null;
    this.selectedFileName = '';
    this.imagePreview = '';
    this.isEditMode = false;
    this.editingWordId = null;
  }
  
  deleteWord(id: string) {
    if (confirm('Are you sure you want to delete this word?')) {
      this.loading = true;
      this.wordService.deleteWord(id).subscribe({
        next: () => {
          this.toastService.showSuccess('Word Deleted!', 'The word has been successfully deleted.');
          this.loadWords();
          this.loading = false;
        },
        error: err => {
          console.error('Error deleting word:', err);
          this.toastService.showError('Delete Failed', 'Failed to delete the word. Please try again.');
          this.loading = false;
        }
      });
    }
  }

  trackByWord(index: number, word: Word): string {
    return word.id;
  }

  getTotalWords(): number {
    return this.words.length;
  }

  getWordsByLevel(level: string): number {
    return this.words.filter(word => word.level === level).length;
  }

  getFilteredWordsByLevel(level: string): number {
    return this.filteredWords.filter(word => word.level === level).length;
  }
}