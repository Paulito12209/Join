# 🎫 Board Tickets - Nach Priorität sortiert

> **Verantwortungsbereich:** Kanbanboard & Taskmanagement  
> **Erstellt:** 18.12.2024  
> **Gesamtzeit geschätzt:** 14-19 Stunden

---

## 🔴 PRIORITÄT: KRITISCH

### Ticket 1: Platzhalter für leere Spalten
**Geschätzte Zeit:** ⏱️ 30-45 Minuten  
**Status:** [ ] Offen  
**Checklist-Referenz:** User Story 1, Punkt 2

**Beschreibung:**  
Wenn eine Spalte keine Tasks enthält, soll ein visueller Platzhalter angezeigt werden.

**Akzeptanzkriterien:**
- [ ] Gestrichelte Box mit abgerundeten Ecken
- [ ] Grauer Hintergrund (z.B. `#F6F7F8`)
- [ ] Text: "No tasks To do" / "No tasks In progress" / etc.
- [ ] Zentrierter Text, leicht transparent

**Technische Hinweise:**
```html
<!-- Beispiel-Struktur -->
<div class="empty-column-placeholder" *ngIf="column.tasks.length === 0">
  No tasks {{ column.name }}
</div>
```

```scss
.empty-column-placeholder {
  border: 2px dashed #D1D1D1;
  border-radius: 12px;
  background: #F6F7F8;
  padding: 20px;
  text-align: center;
  color: #A8A8A8;
}
```

---

### Ticket 2: Zugewiesene Kontakte (Avatare) auf Karten anzeigen
**Geschätzte Zeit:** ⏱️ 1-1.5 Stunden  
**Status:** [ ] Offen  
**Checklist-Referenz:** User Story 1, Punkt 3

**Beschreibung:**  
Am unteren Rand jeder Task-Karte sollen die zugewiesenen Kontakte als farbige Avatar-Kreise erscheinen.

**Akzeptanzkriterien:**
- [ ] Kreisförmige Avatare mit Initialen (z.B. "MM" für Max Mustermann)
- [ ] Overlapping-Effekt bei mehreren zugewiesenen Personen
- [ ] Farben entsprechend dem Kontaktprofil aus Firebase
- [ ] Position: unten links auf der Karte

**Technische Hinweise:**
```scss
.avatar-group {
  display: flex;
  
  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid white;
    margin-left: -8px; // Overlap-Effekt
    
    &:first-child {
      margin-left: 0;
    }
  }
}
```

---

### Ticket 3: Prioritäts-Icon auf Karten anzeigen
**Geschätzte Zeit:** ⏱️ 30-45 Minuten  
**Status:** [ ] Offen  
**Checklist-Referenz:** User Story 1, Punkt 3

**Beschreibung:**  
Jede Task-Karte soll unten rechts ein Prioritäts-Icon zeigen.

**Akzeptanzkriterien:**
- [ ] 🔴 **Urgent:** Zwei Pfeile nach oben (rot)
- [ ] 🟠 **Medium:** Zwei horizontale Striche (orange)
- [ ] 🟢 **Low:** Zwei Pfeile nach unten (grün)
- [ ] Icons bereits in `public/img/icons/` vorhanden (prüfen)

**Technische Hinweise:**
```typescript
getPriorityIcon(priority: string): string {
  const icons = {
    'urgent': 'prio_urgent.svg',
    'medium': 'prio_medium.svg',
    'low': 'prio_low.svg'
  };
  return icons[priority] || icons['medium'];
}
```

---

### Ticket 4: Subtasks Fortschrittsanzeige hinzufügen
**Geschätzte Zeit:** ⏱️ 1.5-2 Stunden  
**Status:** [ ] Offen  
**Checklist-Referenz:** User Story 2 (komplett)

**Beschreibung:**  
Tasks mit Subtasks sollen eine Fortschrittsanzeige zeigen.

**Akzeptanzkriterien:**
- [ ] Fortschrittsbalken unter der Beschreibung
- [ ] Anzeige: "X/Y Subtasks" rechts neben dem Balken
- [ ] Nur anzeigen, wenn Subtasks vorhanden sind
- [ ] Bei 100% Fortschritt: Balken komplett gefüllt
- [ ] Hover/Klick: Detailinfo anzeigen

**Technische Hinweise:**
```html
<div class="subtask-progress" *ngIf="task.subtasks?.length > 0">
  <div class="progress-bar">
    <div class="progress-fill" [style.width.%]="getProgress(task)"></div>
  </div>
  <span class="progress-text">{{ getCompletedSubtasks(task) }}/{{ task.subtasks.length }} Subtasks</span>
</div>
```

```typescript
getProgress(task: Task): number {
  if (!task.subtasks?.length) return 0;
  const completed = task.subtasks.filter(s => s.completed).length;
  return (completed / task.subtasks.length) * 100;
}
```

---

## 🟠 PRIORITÄT: HOCH

### Ticket 5: Task-Detailansicht (Overlay)
**Geschätzte Zeit:** ⏱️ 2-3 Stunden  
**Status:** [ ] Offen  
**Checklist-Referenz:** User Story 1 Punkt 4 & User Story 6

**Beschreibung:**  
Beim Klick auf eine Task-Karte soll sich ein Overlay mit allen Details öffnen.

**Akzeptanzkriterien:**
- [ ] Modal/Overlay mit vollständiger Beschreibung
- [ ] Anzeige aller Subtasks mit Checkbox zum An-/Abhaken
- [ ] Bearbeiten-Button (Stift-Icon)
- [ ] Löschen-Button (Papierkorb-Icon)
- [ ] Alle Details: Kategorie, Titel, Beschreibung, Due Date, Priorität, zugewiesene Personen
- [ ] Schließen mit X oder Klick außerhalb

---

### Ticket 6: Mobile Board-Ansicht umsetzen
**Geschätzte Zeit:** ⏱️ 2-3 Stunden  
**Status:** [ ] Offen  
**Checklist-Referenz:** User Story 7, Punkt 7 & 8

**Beschreibung:**  
Die mobile Ansicht (< 768px) benötigt ein angepasstes Layout.

**Akzeptanzkriterien:**
- [ ] Spalten vertikal untereinander angeordnet
- [ ] Spalten sind scrollbar
- [ ] Kompaktere Kartenansicht
- [ ] Touch-freundliche Abstände (min. 44x44px Touch-Targets)

**Technische Hinweise:**
```scss
@media (max-width: 768px) {
  .board-columns {
    flex-direction: column;
    gap: 1rem;
  }
  
  .column {
    width: 100%;
    max-height: none;
  }
}
```

---

### Ticket 7: Mobile Verschiebe-Buttons (Alternative zu Drag & Drop)
**Geschätzte Zeit:** ⏱️ 1-1.5 Stunden  
**Status:** [ ] Offen  
**Checklist-Referenz:** User Story 7, Punkt 8

**Beschreibung:**  
Auf Mobilgeräten sollen Karten über kleine Pfeil-Buttons verschoben werden können.

**Akzeptanzkriterien:**
- [ ] Kleiner Button in der Ecke der Karte (nur mobile)
- [ ] Öffnet Popup-Menü mit verfügbaren Spalten
- [ ] Task wird in gewählte Spalte verschoben
- [ ] Visuelles Feedback nach Verschieben
- [ ] Button nur anzeigen auf Geräten < 768px

---

### Ticket 8: Drag & Drop visuelles Feedback
**Geschätzte Zeit:** ⏱️ 1-1.5 Stunden  
**Status:** [ ] Offen  
**Checklist-Referenz:** User Story 7, Punkt 2-6

**Beschreibung:**  
Drag & Drop soll ein besseres visuelles Feedback haben.

**Akzeptanzkriterien:**
- [ ] Leichte Drehung der Karte während des Drag-Vorgangs
- [ ] Ziel-Spalte zeigt gestrichelte Drop-Zone an
- [ ] Flüssige Animation ohne Verzögerung
- [ ] Status wird nach Drop korrekt aktualisiert

**Technische Hinweise:**
```scss
.task-card.dragging {
  transform: rotate(3deg);
  opacity: 0.8;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.column.drag-over {
  .drop-zone {
    border: 2px dashed #29ABE2;
    background: rgba(41, 171, 226, 0.1);
  }
}
```

---

## 🟡 PRIORITÄT: MITTEL

### Ticket 9: Plus-Button Funktionalität in Spaltenheader
**Geschätzte Zeit:** ⏱️ 1 Stunde  
**Status:** [ ] Offen  
**Checklist-Referenz:** User Story 1 Punkt 5 & User Story 4 Punkt 2

**Beschreibung:**  
Die (+) Buttons neben den Spalten-Überschriften sollen funktionieren.

**Akzeptanzkriterien:**
- [ ] Klick öffnet Add-Task Dialog
- [ ] Status der Spalte wird automatisch vorausgewählt
- [ ] Kein Plus-Button in der "Done"-Spalte
- [ ] Dialog als Overlay, nicht als Seitennavigation

---

### Ticket 10: Suchfunktion erweitern
**Geschätzte Zeit:** ⏱️ 45 Minuten  
**Status:** [ ] Offen  
**Checklist-Referenz:** User Story 3 (komplett)

**Beschreibung:**  
Die Suchfunktion soll vollständig implementiert werden.

**Akzeptanzkriterien:**
- [ ] Echtzeit-Filterung bei Eingabe
- [ ] Suche in Titel UND Beschreibung
- [ ] Alle Tasks wieder anzeigen bei leerer Suche
- [ ] Hinweis "Keine Ergebnisse gefunden" wenn nichts passt

---

### Ticket 11: Subtasks verwalten (CRUD)
**Geschätzte Zeit:** ⏱️ 1.5-2 Stunden  
**Status:** [ ] Offen  
**Checklist-Referenz:** User Story 5 (komplett)

**Beschreibung:**  
Subtasks sollen hinzugefügt, bearbeitet und gelöscht werden können.

**Akzeptanzkriterien:**
- [ ] Eingabefeld für neue Subtasks
- [ ] Enter-Taste fügt Subtask hinzu (Task wird NICHT erstellt!)
- [ ] X-Button zum Zurücksetzen des Eingabefelds
- [ ] Hover: Stift-Icon zum Bearbeiten, Papierkorb zum Löschen
- [ ] Nach Hinzufügen wird Eingabefeld geleert

---

## 🟢 PRIORITÄT: NIEDRIG

### Ticket 12: Toast-Messages für User-Feedback
**Geschätzte Zeit:** ⏱️ 30-45 Minuten  
**Status:** [ ] Offen  
**Checklist-Referenz:** Allgemein - User Experience & Häufige Fehler

**Beschreibung:**  
User soll Feedback erhalten bei wichtigen Aktionen.

**Akzeptanzkriterien:**
- [ ] Toast bei Task erstellt/gespeichert
- [ ] Toast bei Task gelöscht
- [ ] Toast bei Status-Änderung (optional)
- [ ] Automatisches Ausblenden nach 3 Sekunden

---

### Ticket 13: Hover-States und Transitions verfeinern
**Geschätzte Zeit:** ⏱️ 30 Minuten  
**Status:** [ ] Offen  
**Checklist-Referenz:** User Experience - Punkt 3

**Beschreibung:**  
Alle interaktiven Elemente sollen konsistente Hover-States haben.

**Akzeptanzkriterien:**
- [ ] `cursor: pointer` auf allen Buttons
- [ ] Transitions zwischen 75ms und 125ms
- [ ] `border: unset` auf Inputs/Buttons
- [ ] Einheitliche Hover-Farben

---

## 📊 Zusammenfassung

| Priorität | Ticket | Zeit |
|-----------|--------|------|
| 🔴 Kritisch | 1. Platzhalter für leere Spalten | 30-45 min |
| 🔴 Kritisch | 2. Avatare auf Karten | 1-1.5h |
| 🔴 Kritisch | 3. Prioritäts-Icons | 30-45 min |
| 🔴 Kritisch | 4. Subtasks Fortschrittsanzeige | 1.5-2h |
| 🟠 Hoch | 5. Task-Detailansicht | 2-3h |
| 🟠 Hoch | 6. Mobile Board-Ansicht | 2-3h |
| 🟠 Hoch | 7. Mobile Verschiebe-Buttons | 1-1.5h |
| 🟠 Hoch | 8. Drag & Drop Feedback | 1-1.5h |
| 🟡 Mittel | 9. Plus-Button Funktionalität | 1h |
| 🟡 Mittel | 10. Suchfunktion erweitern | 45 min |
| 🟡 Mittel | 11. Subtasks CRUD | 1.5-2h |
| 🟢 Niedrig | 12. Toast-Messages | 30-45 min |
| 🟢 Niedrig | 13. Hover-States | 30 min |

**Gesamt:** ~14-19 Stunden
