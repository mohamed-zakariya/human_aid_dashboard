// stories-library.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { StoryService } from '../../services/stories/story.service';
import { Story } from '../../interfaces/story-interface/story';

@Component({
  selector: 'app-stories-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.css']
})
export class StoryComponent implements OnInit, OnDestroy {

@ViewChild('storyForm') storyFormRef!: ElementRef;
  stories: Story[] = [];
  filteredStories: Story[] = [];
  searchTerm: string = '';
  selectedLevel: string = 'all';
  isAddingStory: boolean = false;
  isEditingStory: boolean = false;
  editingStoryId: string | null = null;
  
  // New story form data
  newStory: Partial<Story> = {
    story: '',
    kind: 'قصة قصيرة',
    summary: '',
    morale: ''
  };

  private subscription: Subscription = new Subscription();

  // Story kind translations for display
  storyKindTranslations = {
    'قصة قصيرة': 'Short Story',
    'قصة متوسطة': 'Medium Story', 
    'قصة طويلة': 'Long Story'
  };

  constructor(private storyService: StoryService) {}

  ngOnInit() {
    this.loadStories();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadStories() {
    this.subscription.add(
      this.storyService.getStories().subscribe({
        next: (stories) => {
          this.stories = stories;
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error loading stories:', error);
        }
      })
    );
  }

  applyFilters() {
    this.filteredStories = this.stories.filter(story => {
      const matchesSearch = !this.searchTerm || 
        story.story?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        story.summary?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesLevel = this.selectedLevel === 'all' || story.kind === this.selectedLevel;
      
      return matchesSearch && matchesLevel;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onLevelChange() {
    this.applyFilters();
  }

  // Statistics getters
  get totalStories(): number {
    return this.stories.length;
  }

  get shortStories(): number {
    return this.stories.filter(story => story.kind === 'قصة قصيرة').length;
  }

  get mediumStories(): number {
    return this.stories.filter(story => story.kind === 'قصة متوسطة').length;
  }

  get longStories(): number {
    return this.stories.filter(story => story.kind === 'قصة طويلة').length;
  }

  getStoryKindClass(kind: string): string {
    switch(kind) {
      case 'قصة قصيرة': return 'short-story';
      case 'قصة متوسطة': return 'medium-story';
      case 'قصة طويلة': return 'long-story';
      default: return 'default-story';
    }
  }

  getStoryKindDisplay(kind: string): string {
    return this.storyKindTranslations[kind as keyof typeof this.storyKindTranslations] || kind;
  }

  // Add new story functionality
  showAddStoryForm() {
    this.isAddingStory = true;
    this.isEditingStory = false;
    this.newStory = {
      story: '',
      kind: 'قصة قصيرة',
      summary: '',
      morale: ''
    };
  }

  hideAddStoryForm() {
    this.isAddingStory = false;
    this.isEditingStory = false;
    this.editingStoryId = null;
    this.newStory = {
      story: '',
      kind: 'قصة قصيرة',
      summary: '',
      morale: ''
    };
  }

  addStory() {
    if (this.newStory.story && this.newStory.kind && this.newStory.summary && this.newStory.morale) {
      this.subscription.add(
        this.storyService.createStory(
          this.newStory.story,
          this.newStory.kind,
          this.newStory.summary,
          this.newStory.morale
        ).subscribe({
          next: () => {
            this.loadStories();
            this.hideAddStoryForm();
          },
          error: (error) => {
            console.error('Error creating story:', error);
          }
        })
      );
    }
  }

  // Edit story functionality
  editStory(story: Story) {
    this.isEditingStory = true;
    this.isAddingStory = true; // Use same form
    this.editingStoryId = story.id || null;
    this.newStory = {
      story: story.story,
      kind: story.kind,
      summary: story.summary,
      morale: story.morale
    };

    // Scroll to the form
    setTimeout(() => {
      this.storyFormRef?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  updateStory() {
    if (this.editingStoryId && this.newStory.story && this.newStory.kind && this.newStory.summary && this.newStory.morale) {
      this.subscription.add(
        this.storyService.updateStory(
          this.editingStoryId,
          this.newStory.story,
          this.newStory.kind,
          this.newStory.summary,
          this.newStory.morale
        ).subscribe({
          next: () => {
            this.loadStories();
            this.hideAddStoryForm();
          },
          error: (error) => {
            console.error('Error updating story:', error);
          }
        })
      );
    }
  }

  saveStory() {
    if (this.isEditingStory) {
      this.updateStory();
    } else {
      this.addStory();
    }
  }

  deleteStory(story: Story) {
    if (story.id && confirm('Are you sure you want to delete this story?')) {
      this.subscription.add(
        this.storyService.deleteStory(story.id).subscribe({
          next: () => {
            this.loadStories();
          },
          error: (error) => {
            console.error('Error deleting story:', error);
          }
        })
      );
    }
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  trackByStoryId(index: number, story: Story): string {
    return story.id || index.toString();
  }

  // Method to view full story details
  viewStoryDetails(story: Story) {
    // Navigate to story details page or open modal
    console.log('View story details:', story);
  }

  // Method to export stories data
  exportStories() {
    const dataStr = JSON.stringify(this.stories, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'stories-export.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  // Method to handle story duplication
  duplicateStory(story: Story) {
    if (story.story && story.kind && story.summary && story.morale) {
      this.subscription.add(
        this.storyService.createStory(
          story.story + ' (Copy)',
          story.kind,
          story.summary,
          story.morale
        ).subscribe({
          next: () => {
            this.loadStories();
          },
          error: (error) => {
            console.error('Error duplicating story:', error);
          }
        })
      );
    }
  }
}