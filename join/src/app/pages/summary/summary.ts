import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { TasksService } from '../../core/services/tasks.service';
import { Task } from '../add-task/task';

/**
 * Aggregated statistics derived from the task list.
 */
interface TaskStats {
  todoCount: number;
  doneCount: number;
  inProgressCount: number;
  awaitingFeedbackCount: number;
  totalCount: number;
  urgentCount: number;
  nearestDeadline: Date | null;
}

/**
 * Summary dashboard component.
 *
 * @remarks
 * Displays aggregated task statistics, a time-based greeting,
 * and the nearest urgent deadline. Uses OnPush change detection
 * and manually triggers updates when async data changes.
 */
@Component({
  selector: 'app-summary',
  imports: [CommonModule, RouterLink],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Summary implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private tasksService = inject(TasksService);
  private cdr = inject(ChangeDetectorRef);

  /**
   * Display name of the currently authenticated user.
   */
  userName: string = '';

  /**
   * Computed task statistics used by the dashboard.
   */
  stats: TaskStats = {
    todoCount: 0,
    doneCount: 0,
    inProgressCount: 0,
    awaitingFeedbackCount: 0,
    totalCount: 0,
    urgentCount: 0,
    nearestDeadline: null,
  };

  /**
   * Indicates whether task data is still loading.
   */
  isLoading = true;

  /**
   * Controls visibility of the greeting overlay on mobile devices.
   */
  showGreetingOverlay = false;

  /**
   * Triggers the fade-out animation of the greeting overlay.
   */
  greetingFadeOut = false;

  private userSubscription: Subscription | null = null;
  private tasksSubscription: Subscription | null = null;

  /**
   * Initializes subscriptions and greeting behavior.
   */
  ngOnInit(): void {
    this.checkAndShowGreeting();
    this.subscribeToUser();
    this.subscribeToTasks();
  }

  /**
   * Cleans up active subscriptions.
   */
  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.tasksSubscription?.unsubscribe();
  }

  /**
   * Determines whether the greeting overlay should be shown
   * and handles its timed fade-out sequence.
   */
  private checkAndShowGreeting(): void {
    const isMobile = window.innerWidth < 1000;
    const justLoggedIn = sessionStorage.getItem('just_logged_in') === 'true';

    if (isMobile && justLoggedIn) {
      this.showGreetingOverlay = true;
      sessionStorage.removeItem('just_logged_in');

      setTimeout(() => {
        this.greetingFadeOut = true;
        this.cdr.markForCheck();

        setTimeout(() => {
          this.showGreetingOverlay = false;
          this.cdr.markForCheck();
        }, 500);
      }, 1500);
    }
  }

  /**
   * Subscribes to the authenticated user stream and
   * updates the displayed user name.
   */
  private subscribeToUser(): void {
    this.userSubscription = this.authService.user$.subscribe((user) => {
      this.userName = user?.displayName || 'Guest';
      this.cdr.markForCheck();
    });
  }

  /**
   * Subscribes to the task list and recalculates statistics
   * whenever tasks change.
   */
  private subscribeToTasks(): void {
    this.tasksSubscription = this.tasksService.list().subscribe({
      next: (tasks) => {
        this.calculateStats(tasks);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Calculates all dashboard statistics based on the task list.
   */
  private calculateStats(tasks: Task[]): void {
    const urgentTasks = tasks.filter((t) => t.priority === 'urgent');

    let nearestDeadline: Date | null = null;
    for (const task of urgentTasks) {
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        if (!nearestDeadline || dueDate < nearestDeadline) {
          nearestDeadline = dueDate;
        }
      }
    }

    this.stats = {
      todoCount: tasks.filter((t) => t.status === 'todo').length,
      doneCount: tasks.filter((t) => t.status === 'done').length,
      inProgressCount: tasks.filter((t) => t.status === 'in-progress').length,
      awaitingFeedbackCount: tasks.filter((t) => t.status === 'awaiting-feedback').length,
      totalCount: tasks.length,
      urgentCount: urgentTasks.length,
      nearestDeadline,
    };
  }

  /**
   * Returns a greeting based on the current time of day.
   */
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  /**
   * Formats a date for display.
   */
  formatDate(date: Date | null): string {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Returns the label describing the nearest deadline state.
   */
  getDeadlineLabel(): string {
    if (!this.stats.nearestDeadline) {
      return 'No Upcoming Deadline';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(this.stats.nearestDeadline);
    deadline.setHours(0, 0, 0, 0);

    return deadline >= today ? 'Upcoming Deadline' : 'Overdue';
  }
}
