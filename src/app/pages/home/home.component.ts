import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AnalyticsService } from '../../services/anlytics/analytics.service';
import { CommonModule } from '@angular/common';


interface Game {
  name: string;
}

interface Level {
  level_number: number;
  name: string;
  games: Game[];
}

interface Exercise {
  name: string;
  levels: Level[];
}

interface User {
  nationality: string;
  gender?: string;
  lastActiveDate?: string;
}

interface NationalityStats {
  nationality: string;
  count: number;
  percentage: number;
}

interface GenderStats {
  gender: string;
  count: number;
  percentage: number;
}

interface ActivityStats {
  today: number;
  yesterday: number;
  thisWeek: number;
  thisMonth: number;
  inactive: number;
  totalUsers: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{

  constructor(private analyticsService: AnalyticsService) {}

  numAdults: number = 0;
  numChildren: number = 0;
  Guardians: number = 0;
  
  // Analytics data
  nationalityStats: NationalityStats[] = [];
  genderStats: GenderStats[] = [];
  topNationalities: NationalityStats[] = [];
  activityStats: ActivityStats = {
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    thisMonth: 0,
    inactive: 0,
    totalUsers: 0
  };
  
  // Nationality details
  showNationalityDetails = false;
  
  exercises: Exercise[] = [];
  selectedExercise: Exercise | null = null;
  expandedLevel: number | null = null;



  // Add these new properties to your existing component properties
  @ViewChild('activityChart', { static: false }) activityChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('nationalityModal', { static: false }) nationalityModal!: ElementRef<HTMLDivElement>;

  showNationalityModal = false;
  activityChartInstance: any;
    

  ngOnInit() {
    this.analyticsService.getUserStats().subscribe({
      next: stats => {
        console.log('User stats:', stats);
        this.numAdults = stats.numAdults;
        this.numChildren = stats.numChildren;
        this.Guardians = stats.numParents;
      },
      error: err => console.error('Error loading stats:', err)
    });

    // Load exercises data from GraphQL
    this.analyticsService.getExercises().subscribe({
      next: data => {
        this.exercises = data;
        console.log('Fetched exercises:', this.exercises);
      },
      error: err => console.error('Error loading exercises:', err)
    });

    // Load all analytics data
    this.loadAllAnalytics();
  }


// Add this method to initialize the activity chart
ngAfterViewInit() {
  // Initialize chart after view is ready
  setTimeout(() => {
    this.initializeActivityChart();
  }, 100);
}

  initializeActivityChart() {
    if (this.activityChart) {
      const ctx = this.activityChart.nativeElement.getContext('2d');
      
      // Destroy existing chart if it exists
      if (this.activityChartInstance) {
        this.activityChartInstance.destroy();
      }

      this.activityChartInstance = new (window as any).Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Active Today', 'Active Yesterday', 'Active This Week', 'Active This Month', 'Inactive Users'],
          datasets: [{
            data: [
              this.activityStats.today,
              this.activityStats.yesterday,
              this.activityStats.thisWeek,
              this.activityStats.thisMonth,
              this.activityStats.inactive
            ],
            backgroundColor: [
              '#4ecdc4',
              '#45b7d1',
              '#667eea',
              '#764ba2',
              '#ff6b6b'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  const percentage = this.getActivityPercentage(context.parsed);
                  return `${context.label}: ${context.parsed} (${percentage}%)`;
                }
              }
            }
          },
          cutout: '60%'
        }
      });
    }
  }



  loadAllAnalytics() {
    this.analyticsService.getAllUsersWithActivity().subscribe({
      next: (response: any) => {
        const users = response.data.getAllUsers;
        this.processNationalityData(users);
        this.processGenderData(users);
        this.processActivityData(users);
        
        // Refresh chart after data is loaded
        setTimeout(() => {
          this.initializeActivityChart();
        }, 100);
      },
      error: err => console.error('Error loading analytics data:', err)
    });
  }


  processActivityData(users: User[]) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let todayCount = 0;
    let yesterdayCount = 0;
    let weekCount = 0;
    let monthCount = 0;
    let inactiveCount = 0;

    users.forEach(user => {
      if (user.lastActiveDate) {
        const lastActive = new Date(parseInt(user.lastActiveDate));
        
        if (lastActive >= today) {
          todayCount++;
        } else if (lastActive >= yesterday && lastActive < today) {
          yesterdayCount++;
        }
        
        if (lastActive >= weekStart) {
          weekCount++;
        }
        
        if (lastActive >= monthStart) {
          monthCount++;
        }
        
        // Consider inactive if not active for more than 30 days
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        if (lastActive < thirtyDaysAgo) {
          inactiveCount++;
        }
      } else {
        inactiveCount++;
      }
    });

    this.activityStats = {
      today: todayCount,
      yesterday: yesterdayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      inactive: inactiveCount,
      totalUsers: users.length
    };
  }

  // Add these new methods for nationality modal
  openNationalityModal() {
    this.showNationalityModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeNationalityModal() {
    this.showNationalityModal = false;
    document.body.style.overflow = 'auto';
  }


  processNationalityData(users: User[]) {
    const nationalityCount = new Map<string, number>();
    const totalUsers = users.length;

    users.forEach(user => {
      let nationality = user.nationality || 'Unknown';
      nationality = this.normalizeNationality(nationality);
      nationalityCount.set(nationality, (nationalityCount.get(nationality) || 0) + 1);
    });

    this.nationalityStats = Array.from(nationalityCount.entries())
      .map(([nationality, count]) => ({
        nationality,
        count,
        percentage: Math.round((count / totalUsers) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    // Show only top 2 nationalities
    if (this.nationalityStats.length > 2) {
      this.topNationalities = this.nationalityStats.slice(0, 2);
      
      const remainingNationalities = this.nationalityStats.slice(2);
      const othersCount = remainingNationalities.reduce((total, stat) => total + stat.count, 0);
      const othersPercentage = Math.round((othersCount / totalUsers) * 100);
      
      this.topNationalities.push({
        nationality: 'Others',
        count: othersCount,
        percentage: othersPercentage
      });
    } else {
      this.topNationalities = this.nationalityStats;
    }
  }

  processGenderData(users: User[]) {
    const genderCount = new Map<string, number>();
    const totalUsers = users.length;

    users.forEach(user => {
      const gender = user.gender || 'Not Specified';
      genderCount.set(gender, (genderCount.get(gender) || 0) + 1);
    });

    this.genderStats = Array.from(genderCount.entries())
      .map(([gender, count]) => ({
        gender,
        count,
        percentage: Math.round((count / totalUsers) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }

  normalizeNationality(nationality: string): string {
    const normalized = nationality.toLowerCase().trim();
    
    // Handle Egyptian variations
    if (normalized === 'egypt' || normalized === 'egyptian' || normalized === 'eg') {
      return 'Egyptian';
    }
    
    // Handle Turkish variations
    if (normalized === 'turkey' || normalized === 'turkish' || normalized === 'tr') {
      return 'Turkish';
    }
    
    // Handle American variations
    if (normalized === 'usa' || normalized === 'american' || normalized === 'us') {
      return 'American';
    }
    
    // Handle unknown variations
    if (normalized === 'unknown' || normalized === '' || normalized === 'null') {
      return 'Unknown';
    }
    
    // Capitalize first letter for other nationalities
    return nationality.charAt(0).toUpperCase() + nationality.slice(1).toLowerCase();
  }

  getNationalityIcon(nationality: string): string {
    switch(nationality.toLowerCase()) {
      case 'egyptian': return '🇪🇬';
      case 'american': return '🇺🇸';
      case 'british': return '🇬🇧';
      case 'french': return '🇫🇷';
      case 'german': return '🇩🇪';
      case 'saudi': return '🇸🇦';
      case 'turkish': return '🇹🇷';
      case 'others': return '🌍';
      case 'unknown': return '🌍';
      default: return '🌍';
    }
  }

  getGenderIcon(gender: string): string {
    switch(gender.toLowerCase()) {
      case 'male': return '👨';
      case 'female': return '👩';
      case 'not specified': return '👤';
      default: return '👤';
    }
  }

  // New method to toggle nationality details
  toggleNationalityDetails() {
    this.showNationalityDetails = !this.showNationalityDetails;
  }

  // New method to get activity percentage
  getActivityPercentage(count: number): number {
    return this.activityStats.totalUsers > 0 ? 
      Math.round((count / this.activityStats.totalUsers) * 100) : 0;
  }

  selectExercise(exercise: Exercise) {
    this.selectedExercise = this.selectedExercise === exercise ? null : exercise;
    this.expandedLevel = null;
  }

  toggleLevel(levelNumber: number) {
    this.expandedLevel = this.expandedLevel === levelNumber ? null : levelNumber;
  }

  getTotalGames(): number {
    return this.exercises.reduce((total, exercise) => 
      total + exercise.levels.reduce((levelTotal, level) => 
        levelTotal + level.games.length, 0), 0);
  }

  getTotalLevels(): number {
    return this.exercises.reduce((total, exercise) => total + exercise.levels.length, 0);
  }

  getExerciseIcon(exerciseName: string): string {
    switch(exerciseName.toLowerCase()) {
      case 'words exercise': return '📝';
      case 'sentences exercise': return '📚';
      case 'letters exercise': return '🔤';
      default: return '🎯';
    }
  }

  getLevelProgress(level: Level): number {
    // Mock progress data - replace with actual progress from your service
    return Math.floor(Math.random() * 100);
  }

  getGameCount(exercise: Exercise): number {
    return exercise.levels.reduce((total, level) => total + level.games.length, 0);
  }
}