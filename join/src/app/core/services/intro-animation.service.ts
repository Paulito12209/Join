import { Injectable } from '@angular/core';

/**
 * Intro Animation Service
 * 
 * Manages the state of the application's intro animation to ensure it only plays once per session.
 * 
 * **Behavior:**
 * - The animation is shown on the first navigation after app load
 * - Subsequent route changes within the same session skip the animation
 * - A page reload (F5 or browser refresh) resets the state and shows the animation again
 * 
 * **Storage:**
 * The animation state is stored only in memory (not in sessionStorage or localStorage),
 * which means it resets on every page reload. This is intentional to provide a fresh
 * experience when users explicitly reload the application.
 * 
 * @injectable
 * 
 * @example
 * // In a component
 * constructor(private introService: IntroAnimationService) {}
 * 
 * ngOnInit() {
 *   if (!this.introService.hasAnimationBeenShown()) {
 *     this.showIntroAnimation();
 *     this.introService.markAnimationAsShown();
 *   }
 * }
 */
@Injectable({
    providedIn: 'root'
})
export class IntroAnimationService {
    /**
     * Flag indicating whether the intro animation has been shown in the current session.
     * Stored in memory only - resets on page reload.
     */
    private animationShown = false;

    /**
     * Checks if the intro animation has already been shown in the current session.
     * 
     * @returns True if the animation has been shown, false otherwise
     */
    hasAnimationBeenShown(): boolean {
        return this.animationShown;
    }

    /**
     * Marks the intro animation as shown for the current session.
     * 
     * Call this method after displaying the intro animation to prevent it
     * from showing again during route navigation within the same session.
     */
    markAnimationAsShown(): void {
        this.animationShown = true;
    }
}
