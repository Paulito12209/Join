import { Injectable } from '@angular/core';

/**
 * Service der speichert, ob die Intro-Animation bereits gezeigt wurde.
 * Die Animation wird nur einmal pro App-Session angezeigt (nicht bei Routen-Wechsel).
 * Bei einem Seiten-Reload wird die Animation wieder gezeigt.
 */
@Injectable({
    providedIn: 'root'
})
export class IntroAnimationService {
    // Wird nur im Speicher gehalten, nicht im sessionStorage
    // Dadurch wird bei jedem Seiten-Reload die Animation wieder gezeigt
    private animationShown = false;

    /**
     * Prüft, ob die Animation bereits gezeigt wurde.
     */
    hasAnimationBeenShown(): boolean {
        return this.animationShown;
    }

    /**
     * Markiert die Animation als gezeigt.
     */
    markAnimationAsShown(): void {
        this.animationShown = true;
    }
}
