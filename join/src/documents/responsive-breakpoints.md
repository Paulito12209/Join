# Responsive Breakpoints Dokumentation

## Definierte Breakpoints

Die folgenden Breakpoints sind für das Join-Projekt standardisiert:

| Breakpoint | Bereich | Gerät |
|------------|---------|-------|
| Desktop | 1440px – 1024px | Desktop-Monitore |
| Tablet (Landscape) | 1024px – 768px | Tablet im Querformat |
| Tablet (Portrait) | 768px – 480px | Tablet im Hochformat |
| Mobile | < 480px | Smartphone |

---

## Breakpoint-Übersicht als CSS Media Queries

```scss
// Desktop (Standard - keine Media Query nötig)
// max-width: 1440px für Content-Begrenzung

// Tablet Landscape (1024px - 768px)
@media (max-width: 1024px) {
  // Anpassungen für Tablet im Querformat
}

// Tablet Portrait (768px - 480px)
@media (max-width: 768px) {
  // Anpassungen für Tablet im Hochformat
  // Mobile Navigation wird sichtbar
  // Header/Sidebar Umstellung
}

// Mobile (< 480px)
@media (max-width: 480px) {
  // Anpassungen für Smartphones
  // Kompakteste Darstellung
}
```

---

## Aktueller Status der Seiten

### Legende
| Status | Bedeutung |
|--------|-----------|
| ✅ | Breakpoints korrekt implementiert |
| ⚠️ | Teilweise implementiert / Anpassungen erforderlich |
| ❌ | Nicht implementiert |

---

## Seiten-Übersicht

### 📌 Board Seite (`/board`)

**Status:** ⚠️ In Bearbeitung

**Aktuelle Implementierung:**
| Breakpoint | Status | Kommentar |
|------------|--------|-----------|
| 1440px | ✅ | `max-width: 1208px` korrekt |
| 1200px | ✅ | Padding-Anpassung vorhanden |
| 1080px | ✅ | 2-Spalten-Layout |
| 768px | ✅ | Mobile-Layout (vertikale Spalten) |
| 480px | ❌ | Kein spezifischer Breakpoint |

**Aktuelle Media Queries in `board.scss`:**
```scss
@media (max-width: 1200px) { ... }  // Padding-Anpassung
@media (max-width: 1080px) { ... }  // 2-Spalten-Layout
@media (max-width: 768px) { ... }   // Mobile-Layout
```

> [!IMPORTANT]
> Es fehlt ein spezifischer `@media (max-width: 480px)` Breakpoint für optimale Smartphone-Darstellung.

---

### 📌 Add Task Seite (`/add-task`)

**Status:** ⚠️ Anpassung erforderlich

**Aktuelles Problem:**
Die Add Task Seite hat eine **strengere max-width Begrenzung** (`max-width: 900px`) im Vergleich zu den anderen Seiten (`max-width: 1208px`). Dies führt dazu, dass der Inhalt früher "begrenzt" wirkt.

**Aktuelle Implementierung:**
| Breakpoint | Status | Kommentar |
|------------|--------|-----------|
| 1440px | ⚠️ | `max-width: 900px` – zu schmal! |
| 1024px | ❌ | Kein Breakpoint definiert |
| 768px | ❌ | Kein Breakpoint definiert |
| 480px | ❌ | Kein Breakpoint definiert |

**Aktuelle Definition in `add-task.scss`:**
```scss
.add-task-page {
  padding: 32px;
  max-width: 900px;  // ← viel schmaler als andere Seiten (1208px)
  background: #ffffff;
  background-color: #F6F7F8;
}
```

> [!CAUTION]
> **Handlungsbedarf:** Die `max-width` sollte auf `1208px` angehoben werden, um konsistent mit den anderen Seiten zu sein. Responsive Media Queries für alle definierten Breakpoints müssen hinzugefügt werden.

**Vorgeschlagene Änderung:**
```scss
.add-task-page {
  padding: 32px;
  max-width: 1208px;  // Konsistent mit Board-Seite
  // ...
}

@media (max-width: 1024px) {
  .add-task-page {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .add-task-page {
    padding: 16px;
  }
  
  .content {
    grid-template-columns: 1fr;  // Einspaltiges Layout
    gap: 16px;
  }
  
  .right::before {
    display: none;  // Trennlinie ausblenden
  }
}

@media (max-width: 480px) {
  .add-task-page {
    padding: 12px;
  }
}
```

---

### 📌 Contacts Seite (`/contacts`)

**Status:** ✅ Implementiert *(letzte Woche fertiggestellt)*

**Aktuelle Implementierung:**
| Breakpoint | Status | Kommentar |
|------------|--------|-----------|
| 1293px | ✅ | Tablet-spezifisches Layout |
| 1024px | ✅ | Anpassungen für Header/Scroll-Area |
| 768px | ✅ | Vollständiges Mobile-Layout |
| 350px | ✅ | Minimale Anpassungen |

**Aktuelle Media Queries in `contacts.scss`:**
```scss
@media (min-width: 769px) and (max-width: 1293px) { ... }  // Tablet
@media (max-width: 1024px) { ... }  // Tablet Landscape
@media (min-width: 769px) { ... }   // Desktop Only
@media (max-width: 768px) { ... }   // Mobile
@media (max-width: 350px) { ... }   // Sehr kleine Geräte
```

> [!NOTE]
> Die Contacts-Seite ist gut implementiert, aber verwendet `1293px` statt `1440px` als oberen Desktop-Breakpoint. Dies könnte für Konsistenz angepasst werden.

---

### 📌 Summary Seite (`/summary`)

**Status:** ❌ Keine Breakpoints definiert

**Aktuelle Implementierung:**
| Breakpoint | Status | Kommentar |
|------------|--------|-----------|
| Alle | ❌ | Keine Media Queries vorhanden |

**Aktueller Inhalt von `summary.scss`:**
```scss
img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
}
```

> [!WARNING]
> Die Summary-Seite hat **keine responsive Styles**. Alle definierten Breakpoints müssen implementiert werden.

---

## Visuelle Vergleiche

### Desktop-Ansicht (1440px)

Die folgenden Screenshots zeigen die aktuelle Darstellung bei 1440px Breite:

````carousel
![Board Seite bei 1440px](/Users/paulangeleschaquire/.gemini/antigravity/brain/ac7fe2e9-abc8-4098-a43c-129438179f29/board_desktop_1440_1766055318927.png)
<!-- slide -->
![Add Task Seite bei 1440px](/Users/paulangeleschaquire/.gemini/antigravity/brain/ac7fe2e9-abc8-4098-a43c-129438179f29/addtask_desktop_1440_1766055343105.png)
<!-- slide -->
![Contacts Seite bei 1440px](/Users/paulangeleschaquire/.gemini/antigravity/brain/ac7fe2e9-abc8-4098-a43c-129438179f29/contacts_desktop_1440_1766055359841.png)
<!-- slide -->
![Summary Seite bei 1440px](/Users/paulangeleschaquire/.gemini/antigravity/brain/ac7fe2e9-abc8-4098-a43c-129438179f29/summary_desktop_1440_1766055375677.png)
````

### Vergleich bei 1100px Breite

Diese Screenshots zeigen das Problem mit der Add Task Seite – der Inhalt ist deutlich schmaler im Vergleich zur Board-Seite:

````carousel
![Board Seite bei 1100px](/Users/paulangeleschaquire/.gemini/antigravity/brain/ac7fe2e9-abc8-4098-a43c-129438179f29/board_1100_comparison_1766055422134.png)
<!-- slide -->
![Add Task Seite bei 1100px – zu schmaler Inhalt!](/Users/paulangeleschaquire/.gemini/antigravity/brain/ac7fe2e9-abc8-4098-a43c-129438179f29/addtask_1100_narrow_1766055405873.png)
````

> [!IMPORTANT]
> Im direkten Vergleich sieht man, dass die Add Task Seite ihren maximalen Inhaltsbereich bereits bei 900px erreicht, während die Board-Seite erst bei 1208px begrenzt wird.

---

## Prioritätenliste für Bearbeitung

Basierend auf dem aktuellen Arbeitsbereich (Board & Add Task):

| Priorität | Seite | Aufwand | Beschreibung |
|-----------|-------|---------|--------------|
| 🔴 Hoch | Add Task | Mittel | `max-width` anpassen, alle Breakpoints hinzufügen |
| 🟠 Mittel | Board | Gering | 480px Breakpoint hinzufügen |
| 🟡 Niedrig | Summary | Mittel | Alle Breakpoints implementieren |
| 🟢 Abgeschlossen | Contacts | — | Nur optionale Konsistenz-Anpassungen |

---

## Empfohlene SCSS-Variablen

Für konsistente Breakpoints-Nutzung könnte folgende Variable-Definition in `styles.scss` hinzugefügt werden:

```scss
// === RESPONSIVE BREAKPOINTS ===
$breakpoint-desktop: 1440px;
$breakpoint-tablet-landscape: 1024px;
$breakpoint-tablet-portrait: 768px;
$breakpoint-mobile: 480px;

// Max-Width für Content-Container
$content-max-width: 1208px;
```

---

## Weitere betroffene Dateien

Neben den Haupt-Seiten sollten auch folgende Komponenten auf Breakpoint-Konsistenz geprüft werden:

- [main-layout.scss](file:///Users/paulangeleschaquire/Documents/Developer%20Akademie/Inhalte/Projekte/14%20%E2%8F%90%20Join/Join/join/src/app/core/layouts/main-layout/main-layout.scss) – verwendet 768px ✅
- [add-task-board.scss](file:///Users/paulangeleschaquire/Documents/Developer%20Akademie/Inhalte/Projekte/14%20%E2%8F%90%20Join/Join/join/src/app/pages/board/add-task-board.scss) – Board-Dialog
- [task-dialog.scss](file:///Users/paulangeleschaquire/Documents/Developer%20Akademie/Inhalte/Projekte/14%20%E2%8F%90%20Join/Join/join/src/app/pages/board/task-dialog/task-dialog.scss) – Task-Detail-Dialog
- [dialog-contact.scss](file:///Users/paulangeleschaquire/Documents/Developer%20Akademie/Inhalte/Projekte/14%20%E2%8F%90%20Join/Join/join/src/app/pages/contacts/dialog-contact.scss) – Kontakt-Dialog
- [help.scss](file:///Users/paulangeleschaquire/Documents/Developer%20Akademie/Inhalte/Projekte/14%20%E2%8F%90%20Join/Join/join/src/app/pages/help/help.scss) – Hilfe-Seite
- [legal-notes.scss](file:///Users/paulangeleschaquire/Documents/Developer%20Akademie/Inhalte/Projekte/14%20%E2%8F%90%20Join/Join/join/src/app/pages/legal-notes/legal-notes.scss) – Impressum
- [privacy-policy.scss](file:///Users/paulangeleschaquire/Documents/Developer%20Akademie/Inhalte/Projekte/14%20%E2%8F%90%20Join/Join/join/src/app/pages/privacy-policy/privacy-policy.scss) – Datenschutz

---

## Referenz zur Checklist

Diese Dokumentation erfüllt die folgenden Kriterien aus [checklist-2.md](file:///Users/paulangeleschaquire/Documents/Developer%20Akademie/Inhalte/Projekte/14%20%E2%8F%90%20Join/Join/join/src/documents/checklist-2.md):

> **Responsiveness**
> - [ ] Jede Seite funktioniert bei jeder Auflösung bis min. 320px
> - [ ] Jede Seite funktioniert sowohl mobile als auch auf Desktop
> - [ ] Content-Begrenzung für große Monitore (max-width bei 1440px / linksbündig)
> - [ ] Keine horizontalen Scrollbalken bei kleineren Auflösungen

---

*Erstellt am: 18.12.2024*  
*Letzte Aktualisierung: 18.12.2024*
