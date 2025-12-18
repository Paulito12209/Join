# 📚 Firebase Datenfluss Dokumentation

## 🎯 Einführung und Lernziele

Diese Dokumentation erklärt den vollständigen Datenfluss zwischen **Firebase Firestore** und der **Angular-Anwendung** für zwei zentrale Features:

1. **Board-Ansicht** - Anzeige und Verwaltung von Tasks (Aufgaben)
2. **Kontakte-Seite** - Anzeige und Verwaltung von Kontakten

Nach dem Durcharbeiten dieser Dokumentation wirst du verstehen:

- ✅ Wie Firebase in einer Angular-Anwendung konfiguriert wird
- ✅ Wie Services als Vermittlungsschicht zwischen Firebase und UI fungieren
- ✅ Wie Echtzeit-Updates mit `onSnapshot` und `collectionData` funktionieren
- ✅ Wie Komponenten Daten abonnieren und anzeigen
- ✅ Den kompletten Datenfluss vom Backend zur Anzeige

---

## 📁 Dateiübersicht - Welche Dateien spielen zusammen?

### Architektur-Diagramm

```mermaid
graph TB
    subgraph "Firebase Cloud"
        A[("☁️ Firebase Firestore")]
    end
    
    subgraph "Konfiguration"
        B["app.config.ts<br/>Firebase Setup"]
    end
    
    subgraph "Services (Datenschicht)"
        C["tasks.service.ts<br/>CRUD für Tasks"]
        D["contacts.service.ts<br/>CRUD für Contacts"]
    end
    
    subgraph "Interfaces (Datenmodelle)"
        E["task.ts<br/>Task Interface"]
        F["Contact Interface<br/>(in contacts.service.ts)"]
    end
    
    subgraph "Komponenten (UI-Schicht)"
        G["board.ts / board.html<br/>Board-Ansicht"]
        H["contacts.ts / contacts.html<br/>Kontakte-Liste"]
        I["dialog-contact.ts<br/>Kontakt-Dialog"]
    end
    
    A --> B
    B --> C
    B --> D
    E --> C
    F --> D
    C --> G
    D --> H
    D --> I
```

### Alle beteiligten Dateien

| Datei | Pfad | Zweck |
|-------|------|-------|
| `app.config.ts` | `/app/app.config.ts` | Firebase-Konfiguration und Initialisierung |
| `tasks.service.ts` | `/app/core/services/tasks.service.ts` | Service für alle Task-Operationen (CRUD) |
| `contacts.service.ts` | `/app/core/services/contacts.service.ts` | Service für alle Kontakt-Operationen (CRUD) |
| `task.ts` | `/app/pages/add-task/task.ts` | TypeScript Interface für Task-Daten |
| `board.ts` | `/app/pages/board/board.ts` | Board-Komponente (TypeScript-Logik) |
| `board.html` | `/app/pages/board/board.html` | Board-Template (HTML-Ansicht) |
| `contacts.ts` | `/app/pages/contacts/contacts.ts` | Kontakte-Komponente (TypeScript-Logik) |
| `contacts.html` | `/app/pages/contacts/contacts.html` | Kontakte-Template (HTML-Ansicht) |
| `dialog-contact.ts` | `/app/pages/contacts/dialog-contact.ts` | Dialog für Kontakt erstellen/bearbeiten |

---

## 🔧 Teil 1: Firebase-Konfiguration

### Datei: `app.config.ts`

**Zweck:** Diese Datei ist der Einstiegspunkt für Firebase. Hier wird Firebase initialisiert und dem Angular-Modulsystem zur Verfügung gestellt.

```typescript
// app.config.ts - Vereinfachte Ansicht
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... andere Provider
    
    // Firebase App initialisieren mit Konfigurationsdaten
    provideFirebaseApp(() => initializeApp({
      projectId: "join-e9b30",
      appId: "1:600355908800:web:7d13b83805563671d95125",
      apiKey: "AIzaSyCaCIW59UqKhqqGE7zrxJmohgA0nkq1C6s",
      authDomain: "join-e9b30.firebaseapp.com",
      // ... weitere Konfiguration
    })),
    
    // Firestore-Datenbank bereitstellen
    provideFirestore(() => getFirestore())
  ]
};
```

### 🎓 Erklärung für Lernende

| Funktion | Erklärung |
|----------|-----------|
| `provideFirebaseApp()` | Initialisiert die Firebase-App mit deinen Projektdaten |
| `initializeApp()` | Verbindet deine App mit dem Firebase-Projekt |
| `provideFirestore()` | Stellt die Firestore-Datenbank als injizierbaren Service bereit |
| `getFirestore()` | Holt die Firestore-Instanz |

> **💡 Tipp:** Die Konfigurationsdaten erhältst du in der Firebase Console unter Projekteinstellungen → SDK-Setup.

---

## 📊 Teil 2: Datenmodelle (Interfaces)

### 2.1 Task Interface (`task.ts`)

Das Task Interface definiert die **Struktur einer Aufgabe** in der Anwendung:

```typescript
// Definition der möglichen Status-Werte
export type TaskStatus = 'todo' | 'in-progress' | 'awaiting-feedback' | 'done';

// Unter-Aufgaben innerhalb eines Tasks
export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

// Referenz auf zugewiesene Benutzer
export interface AssigneeRef {
  uid: string;       // Eindeutige ID
  name?: string;     // Optional: Name
  email?: string;    // Optional: E-Mail
}

// Haupt-Interface für einen Task
export interface Task {
  id?: string;                                    // Firestore Dokument-ID
  title: string;                                  // Titel (Pflichtfeld)
  description?: string;                           // Beschreibung
  status: TaskStatus;                             // Aktueller Status
  priority: 'low' | 'medium' | 'high' | 'urgent'; // Priorität
  dueDate?: string;                               // Fälligkeitsdatum (ISO)
  createdAt: string;                              // Erstellt am (ISO)
  updatedAt: string;                              // Zuletzt geändert (ISO)
  createdBy?: AssigneeRef;                        // Ersteller
  assignees?: AssigneeRef[];                      // Zugewiesene Personen
  category?: 'user-story' | 'technical-task';     // Kategorie
  subtasks?: Subtask[];                           // Unter-Aufgaben
  projectId?: string;                             // Projekt-Zuordnung
}
```

### 2.2 Contact Interface (`contacts.service.ts`)

```typescript
export interface Contact {
  id?: string;    // Firestore Dokument-ID
  name: string;   // Vollständiger Name (Pflichtfeld)
  email?: string; // E-Mail-Adresse
  phone?: string; // Telefonnummer
  color?: string; // Avatar-Farbe (automatisch vergeben)
}
```

### 🎓 Warum Interfaces verwenden?

| Vorteil | Erklärung |
|---------|-----------|
| **Typsicherheit** | TypeScript prüft, ob Daten dem Schema entsprechen |
| **Autovervollständigung** | IDE zeigt verfügbare Eigenschaften an |
| **Dokumentation** | Code ist selbsterklärend |
| **Fehlervermeidung** | Tippfehler werden beim Kompilieren erkannt |

---

## ⚙️ Teil 3: Services - Die Datenschicht

### 3.1 TasksService (`tasks.service.ts`)

**Zweck:** Dieser Service ist die zentrale Anlaufstelle für alle Task-bezogenen Datenoperationen.

#### Struktur des Services

```typescript
@Injectable({ providedIn: 'root' })
export class TasksService {
  // Firebase Firestore Instanz (injiziert)
  private firestore = inject(Firestore);
  
  // NgZone für Angular Change Detection
  private ngZone = inject(NgZone);
  
  // Name der Firestore-Collection
  private readonly collectionPath = 'tasks';
}
```

#### 3.1.1 Methode: `list()` - Alle Tasks abrufen

**Dies ist die wichtigste Methode!** Sie nutzt Echtzeit-Updates.

```typescript
list(): Observable<Task[]> {
  return new Observable<Task[]>(observer => {
    // 1. Referenz zur 'tasks' Collection erstellen
    const colRef = collection(this.firestore, this.collectionPath);
    
    // 2. Query mit Sortierung nach 'createdAt' erstellen
    const q = query(colRef, orderBy('createdAt'));
    
    // 3. Live-Listener mit onSnapshot registrieren
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Task[] = [];
      
      // 4. Durch alle Dokumente iterieren
      snapshot.forEach((doc) => {
        const data = doc.data() as Task;
        // Dokument-ID hinzufügen
        items.push({ id: doc.id, ...data });
      });
      
      // 5. In Angular Zone ausführen (für Change Detection)
      this.ngZone.run(() => {
        observer.next(items);
      });
    }, (error) => {
      observer.error(error);
    });
    
    // 6. Cleanup-Funktion wenn Observable beendet wird
    return () => {
      unsubscribe();
    };
  });
}
```

#### 🎓 Detaillierte Erklärung des Datenflusses

```mermaid
sequenceDiagram
    participant K as Komponente
    participant S as TasksService
    participant FS as Firestore
    
    K->>S: list().subscribe()
    S->>FS: onSnapshot(query)
    FS-->>S: Initiale Daten
    S-->>K: observer.next(tasks)
    K->>K: UI aktualisieren
    
    Note over FS: Änderung in Datenbank
    FS-->>S: Automatische Benachrichtigung
    S-->>K: observer.next(aktualisierte tasks)
    K->>K: UI automatisch aktualisiert
```

| Schritt | Was passiert |
|---------|--------------|
| 1️⃣ | Komponente ruft `list()` auf und abonniert das Observable |
| 2️⃣ | `onSnapshot` registriert einen Echtzeit-Listener in Firestore |
| 3️⃣ | Firestore sendet sofort alle vorhandenen Daten |
| 4️⃣ | Bei JEDER Änderung (hinzufügen, bearbeiten, löschen) sendet Firestore automatisch Updates |
| 5️⃣ | `ngZone.run()` stellt sicher, dass Angular die Änderungen erkennt |
| 6️⃣ | Wenn die Komponente zerstört wird, wird der Listener abgemeldet |

#### 3.1.2 Methode: `getById()` - Einzelnen Task abrufen

```typescript
getById(id: string): Observable<Task | null> {
  // Nutzt list() und filtert nach ID
  return this.list().pipe(
    map(items => items.find(t => t.id === id) ?? null)
  );
}
```

#### 3.1.3 Methode: `listByStatus()` - Tasks nach Status filtern

```typescript
listByStatus(status: Task['status']): Observable<Task[]> {
  return this.list().pipe(
    map(items => items.filter(t => t.status === status))
  );
}
```

#### 3.1.4 Methode: `create()` - Neuen Task erstellen

```typescript
async create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const colRef = collection(this.firestore, this.collectionPath);
  const now = new Date().toISOString();
  
  // Timestamps automatisch setzen
  const payload: Task = { 
    ...task, 
    createdAt: now, 
    updatedAt: now 
  };
  
  // Dokument zu Firestore hinzufügen
  const docRef = await addDoc(colRef, payload);
  
  // Task mit generierter ID zurückgeben
  return { id: docRef.id, ...payload };
}
```

#### 3.1.5 Methode: `update()` - Task aktualisieren

```typescript
async update(id: string, patch: Partial<Task>): Promise<Task | null> {
  // Dokument-Referenz erstellen
  const docRef = doc(this.firestore, `${this.collectionPath}/${id}`);
  const updatedAt = new Date().toISOString();
  
  // Nur geänderte Felder + updatedAt aktualisieren
  await updateDoc(docRef, { ...patch, updatedAt });
  
  return { id, ...(patch as Task), updatedAt } as Task;
}
```

#### 3.1.6 Methode: `remove()` - Task löschen

```typescript
async remove(id: string): Promise<boolean> {
  const docRef = doc(this.firestore, `${this.collectionPath}/${id}`);
  await deleteDoc(docRef);
  return true;
}
```

---

### 3.2 ContactsService (`contacts.service.ts`)

**Zweck:** Verwaltet alle CRUD-Operationen für Kontakte.

#### Besonderheit: Automatische Avatar-Farben

```typescript
// Farbpalette für Avatare
private readonly avatarPalette: string[] = [
  '#ff7a00', '#9327ff', '#ff745e', '#ffc701',
  '#ffe62b', '#ff5eb3', '#00bee8', '#ffa35e',
  '#0038ff', '#ff4646', '#6e52ff', '#1fd7c1',
  '#fc71ff', '#c3ff2b', '#ffbb2b',
];
```

#### 3.2.1 Methode: `getContacts()` - Alle Kontakte abrufen

```typescript
getContacts(sortBy: SortBy = 'name', sortDir: SortDir = 'asc'): Observable<Contact[]> {
  const q = query(this.colRef, orderBy('name', sortDir));
  
  // collectionData ist ein Wrapper von AngularFire
  // Er gibt automatisch ein Observable mit Echtzeit-Updates zurück
  return collectionData(q, { idField: 'id' }) as Observable<Contact[]>;
}
```

> **💡 Unterschied zu TasksService:** Hier wird `collectionData()` von AngularFire verwendet, was intern `onSnapshot` nutzt, aber weniger Code erfordert.

#### 3.2.2 Methode: `createContact()` - Kontakt erstellen

```typescript
async createContact(input: Pick<Contact, 'name'> & Partial<Contact>): Promise<Contact> {
  // 1. Namen kapitalisieren (Max Mustermann)
  const fixedName = this.capitalizeName(input.name);
  
  // 2. Nächste Farbe aus Palette holen
  const index = await this.nextPaletteIndex();
  
  // 3. Payload erstellen
  const payload: Omit<Contact, 'id'> = {
    name: fixedName,
    email: input.email?.trim(),
    phone: input.phone?.trim(),
    color: this.avatarPalette[index]
  };
  
  // 4. In Firestore speichern
  const ref = await addDoc(this.colRef, payload);
  
  return { id: ref.id, ...payload };
}
```

#### 3.2.3 Private Methode: `nextPaletteIndex()` - Farbzuweisung

```typescript
private async nextPaletteIndex(): Promise<number> {
  const len = this.avatarPalette.length;
  
  // Transaction für thread-sichere Aktualisierung
  return runTransaction(this.firestore, async (tx) => {
    const snap = await tx.get(this.countersDoc);
    let next = 0;
    
    if (snap.exists()) {
      // Nächsten Index berechnen (Round-Robin)
      const seq = snap.data()?.avatarSeq ?? 0;
      next = (seq + 1) % len;
      tx.update(this.countersDoc, { avatarSeq: next });
    } else {
      // Counter-Dokument erstellen
      tx.set(this.countersDoc, { avatarSeq: 0 });
    }
    
    return next;
  });
}
```

#### 🎓 Was ist Round-Robin?

```
Palette:  [🟠, 🟣, 🔴, 🟡, 🟤, ...]
Index:     0   1   2   3   4  ...

Kontakt 1 → Index 0 → 🟠
Kontakt 2 → Index 1 → 🟣
Kontakt 3 → Index 2 → 🔴
...
Kontakt 15 → Index 14 → letzte Farbe
Kontakt 16 → Index 0 → 🟠 (wieder von vorne)
```

---

## 🖼️ Teil 4: Board-Komponente - Task-Anzeige

### 4.1 TypeScript-Logik (`board.ts`)

#### Grundstruktur

```typescript
@Component({
  selector: 'app-board',
  imports: [CdkDropList, CdkDrag, CommonModule, FormsModule, AddTaskBoard],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  // Service injizieren
  private tasksService = inject(TasksService);
  private cdr = inject(ChangeDetectorRef);
  
  // Alle Tasks (ungefiltert)
  private allTasks: Task[] = [];
  
  // Suchbegriff
  searchQuery: string = '';
  
  // Gefilterte Arrays für jede Spalte
  todo: Task[] = [];
  inProgress: Task[] = [];
  awaitFeedback: Task[] = [];
  done: Task[] = [];
}
```

#### Daten-Subscription im Constructor

```typescript
constructor() {
  // Tasks vom Service abonnieren
  this.tasksService.list().subscribe((tasks) => {
    // Alle Tasks speichern
    this.allTasks = tasks;
    
    // Filter anwenden (wenn Suche aktiv)
    this.filterTasks();
    
    // Angular zur Aktualisierung zwingen
    this.cdr.detectChanges();
  });
}
```

#### Filterlogik

```typescript
filterTasks() {
  let filtered = this.allTasks;
  
  // Suche anwenden wenn Suchbegriff vorhanden
  if (this.searchQuery.trim().length > 0) {
    const query = this.searchQuery.toLowerCase();
    filtered = this.allTasks.filter(t =>
      t.title.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query))
    );
  }
  
  // Nach Status aufteilen
  this.todo = filtered.filter(t => t.status === 'todo');
  this.inProgress = filtered.filter(t => t.status === 'in-progress');
  this.awaitFeedback = filtered.filter(t => t.status === 'awaiting-feedback');
  this.done = filtered.filter(t => t.status === 'done');
}
```

#### Drag & Drop - Status-Update

```typescript
drop(event: CdkDragDrop<Task[]>) {
  if (event.previousContainer !== event.container) {
    const task = event.previousContainer.data[event.previousIndex];
    
    // Neuen Status basierend auf Ziel-Container bestimmen
    let newStatus: Task['status'] = 'todo';
    
    if (event.container.id === 'progressList') newStatus = 'in-progress';
    else if (event.container.id === 'feedbackList') newStatus = 'awaiting-feedback';
    else if (event.container.id === 'doneList') newStatus = 'done';
    else if (event.container.id === 'todoList') newStatus = 'todo';
    
    // In Firestore aktualisieren
    if (task.id) {
      this.tasksService.update(task.id, { status: newStatus });
    }
    
    // UI lokal aktualisieren
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }
}
```

### 4.2 Template (`board.html`) - Wichtige Ausschnitte

```html
<!-- Suchfeld mit Two-Way-Binding -->
<input 
  type="text" 
  placeholder="Find Task" 
  [(ngModel)]="searchQuery" 
  (ngModelChange)="filterTasks()">

<!-- ToDo-Spalte mit Drag & Drop -->
<div cdkDropList 
     id="todoList" 
     #todoList="cdkDropList" 
     [cdkDropListData]="todo"
     [cdkDropListConnectedTo]="[progressList, feedbackList, doneList]" 
     (cdkDropListDropped)="drop($event)">
  
  <!-- Jeder Task als draggable Element -->
  <div class="example-box" 
       *ngFor="let task of todo" 
       cdkDrag 
       (click)="openTask(task)">
    
    <div class="task-category" 
         [ngClass]="{'user-story': task.category === 'user-story'}">
      {{ task.category === 'user-story' ? 'User Story' : 'Technical Task' }}
    </div>
    <div class="task-title">{{ task.title }}</div>
    <div class="task-description">{{ task.description }}</div>
  </div>
</div>
```

---

## 👥 Teil 5: Contacts-Komponente - Kontakt-Anzeige

### 5.1 TypeScript-Logik (`contacts.ts`)

#### Daten-Streams mit RxJS

```typescript
@Component({
  selector: 'app-contacts',
  imports: [CommonModule, DialogContact],
  templateUrl: './contacts.html',
})
export class Contacts {
  private readonly contactsSvc = inject(ContactsService);
  
  // Observable: Alle Kontakte sortiert
  contacts$ = this.contactsSvc.getContacts('name', 'asc');
  
  // Observable: Kontakte nach Buchstaben gruppiert
  grouped$ = this.contacts$.pipe(
    map((contacts: Contact[]) => {
      const groups: Record<string, Contact[]> = {};
      
      // Nach Anfangsbuchstaben gruppieren
      for (const c of contacts) {
        const letter = (c.name?.charAt(0) || '').toUpperCase();
        if (!letter) continue;
        (groups[letter] ??= []).push(c);
      }
      
      // Alphabetisch sortierte Gruppen zurückgeben
      return Object.keys(groups)
        .sort()
        .map((letter) => ({
          letter,
          contacts: groups[letter].sort((a, b) =>
            a.name.localeCompare(b.name, 'de')
          ),
        }));
    })
  );
  
  // Aktuell ausgewählter Kontakt
  selectedContact: Contact | null = null;
}
```

#### Kontakt auswählen

```typescript
selectContact(contact: Contact) {
  this.selectedContact = contact;
  
  // Detail-Ansicht einblenden
  document.querySelector('.contact-detail')?.classList.add('visible');
  
  // Aktions-Menü schließen
  this.showActions = false;
}
```

#### Kontakt löschen

```typescript
async deleteContact() {
  const c = this.selectedContact;
  if (!c || !c.id) return;
  
  // In Firestore löschen
  await this.contactsSvc.deleteContact(c.id);
  
  // UI zurücksetzen
  this.selectedContact = null;
  document.querySelector('.contact-detail')?.classList.remove('visible');
}
```

### 5.2 Template (`contacts.html`) - Wichtige Ausschnitte

```html
<!-- Kontaktliste mit Async Pipe -->
<div *ngIf="grouped$ | async as groups">
  
  <!-- Für jede Buchstaben-Gruppe -->
  <div *ngFor="let group of groups" class="letter-group">
    <div class="group-letter">{{ group.letter }}</div>
    
    <!-- Für jeden Kontakt in der Gruppe -->
    <div *ngFor="let c of group.contacts"
         class="contact-entry"
         (click)="selectContact(c)"
         [ngClass]="{ active: selectedContact === c }">
      
      <!-- Avatar-Kreis mit Initialen -->
      <div class="circle" [style.background-color]="c.color || '#ccc'">
        {{ getInitials(c.name) }}
      </div>
      
      <div class="contact-info">
        <div class="name">{{ c.name }}</div>
        <div class="email">{{ c.email }}</div>
      </div>
    </div>
  </div>
</div>
```

#### 🎓 Was macht die Async Pipe (`| async`)?

```
Ohne Async Pipe:                    Mit Async Pipe:
───────────────                     ───────────────
ngOnInit() {                        <!-- Einfach im Template -->
  this.sub = this.grouped$          *ngIf="grouped$ | async as groups"
    .subscribe(data => {
      this.groups = data;           ✅ Automatisches Subscribe
    });                             ✅ Automatisches Unsubscribe
}                                   ✅ Weniger Boilerplate-Code
                                    ✅ Keine Memory Leaks
ngOnDestroy() {
  this.sub.unsubscribe();
}
```

---

## 🔄 Teil 6: Vollständiger Datenfluss - Zusammenfassung

### 6.1 Datenfluss bei der Board-Ansicht

```mermaid
flowchart TD
    subgraph "1. Initialisierung"
        A[Board-Komponente wird geladen]
        B[Constructor wird ausgeführt]
    end
    
    subgraph "2. Daten abholen"
        C[tasksService.list wird aufgerufen]
        D[onSnapshot registriert Listener]
        E[Firestore sendet initiale Daten]
    end
    
    subgraph "3. Verarbeitung"
        F[Tasks werden empfangen]
        G[filterTasks wird aufgerufen]
        H[Tasks werden nach Status aufgeteilt]
    end
    
    subgraph "4. Anzeige"
        I[todo, inProgress, etc. Arrays gefüllt]
        J[*ngFor in Template zeigt Tasks]
        K[Change Detection aktualisiert UI]
    end
    
    subgraph "5. Echtzeit-Updates"
        L[User verschiebt Task per Drag&Drop]
        M[tasksService.update wird aufgeru]
        N[Firestore Dokument wird aktualisiert]
        O[onSnapshot sendet Update an ALLE Clients]
    end
    
    A --> B --> C --> D --> E --> F --> G --> H --> I --> J --> K
    L --> M --> N --> O --> F
```

### 6.2 Datenfluss bei der Kontakte-Seite

```mermaid
flowchart TD
    subgraph "1. Observable-Kette"
        A[contacts$ = getContacts]
        B[grouped$ = contacts$.pipe map]
    end
    
    subgraph "2. Template Binding"
        C["grouped$ | async"]
        D[*ngIf empfängt Daten]
        E[*ngFor iteriert über Gruppen]
    end
    
    subgraph "3. Interaktion"
        F[User klickt Kontakt]
        G[selectContact wird aufgerufen]
        H[selectedContact wird gesetzt]
        I[Detail-Ansicht wird sichtbar]
    end
    
    subgraph "4. CRUD Operationen"
        J[User erstellt/bearbeitet/löscht]
        K[Dialog-Komponente ruft Service]
        L[Firestore wird aktualisiert]
        M[collectionData emittiert Update]
        N[UI aktualisiert automatisch]
    end
    
    A --> B --> C --> D --> E
    E --> F --> G --> H --> I
    J --> K --> L --> M --> N --> C
```

---

## 📝 Teil 7: Wichtige Konzepte für Prüfungen

### 7.1 Echtzeit-Updates mit Firebase

| Methode | Beschreibung | Verwendung |
|---------|--------------|------------|
| `onSnapshot()` | Native Firebase-Methode | TasksService für volle Kontrolle |
| `collectionData()` | AngularFire Wrapper | ContactsService für schnelle Implementierung |

### 7.2 Observable vs Promise

```typescript
// Observable (Echtzeit-Stream)
list(): Observable<Task[]>
// → Emittiert MEHRFACH bei Änderungen
// → Muss abonniert werden (.subscribe oder | async)
// → Muss abgemeldet werden um Memory Leaks zu vermeiden

// Promise (Einmalig)
async create(): Promise<Task>
// → Gibt EINMAL ein Ergebnis zurück
// → Verwendet mit await
// → Kein Cleanup nötig
```

### 7.3 Injection Pattern

```typescript
// Moderner Ansatz (empfohlen für standalone components)
private tasksService = inject(TasksService);

// Klassischer Ansatz
constructor(private tasksService: TasksService) {}
```

### 7.4 Fehlerbehandlung

```typescript
// Im Service
onSnapshot(q, 
  (snapshot) => { /* Erfolg */ },
  (error) => {
    console.error("Firestore Error:", error);
    observer.error(error);
  }
);

// In der Komponente
this.tasksService.list().subscribe({
  next: (tasks) => { /* Daten verarbeiten */ },
  error: (err) => { /* Fehler behandeln */ }
});
```

---

## ✅ Checkliste: Hast du alles verstanden?

- [ ] Ich verstehe, wie Firebase in `app.config.ts` konfiguriert wird
- [ ] Ich kann erklären, was ein Service in Angular ist
- [ ] Ich verstehe den Unterschied zwischen `onSnapshot` und `collectionData`
- [ ] Ich weiß, wie Observables funktionieren und warum sie für Echtzeit-Updates wichtig sind
- [ ] Ich kann den Datenfluss von Firebase → Service → Komponente → Template erklären
- [ ] Ich verstehe, wie die Async Pipe funktioniert
- [ ] Ich weiß, wie CRUD-Operationen (Create, Read, Update, Delete) implementiert werden

---

## 🔗 Weiterführende Ressourcen

- [Firebase Firestore Dokumentation](https://firebase.google.com/docs/firestore)
- [AngularFire GitHub](https://github.com/angular/angularfire)
- [RxJS Dokumentation](https://rxjs.dev/)
- [Angular CDK Drag & Drop](https://material.angular.io/cdk/drag-drop/overview)

---

*Erstellt am: 18.12.2024*  
*Für: Join-Projekt - Developer Akademie*
