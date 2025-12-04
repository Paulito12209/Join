# README


Kurzfassung: Ziele und Arbeitsweise von „Join“. Figma dient nur zur Visualisierung; Inhalte wachsen mit dem Projektstand.


## Inhalt

- Projektüberblick
- Screenshots
- Features
- Technischer Stack
- Installation
- Entwicklung
- Tests
- Build und Deployment
- Ordnerstruktur
- Konfiguration und Umgebungsvariablen
- Qualität und Sicherheit
- Roadmap
- Lizenz

---

## Projektüberblick

Kurzbeschreibung des Ziels der Anwendung, Hauptnutzergruppe und der wichtigsten Use Cases. Formuliere hier in 2–4 Sätzen, was das Produkt leistet und welchen Mehrwert es bietet.

- Primärer Use Case: Kontaktverwaltung und Team‑Zusammenarbeit
- Zielgruppe: Studententeams und kleine Projektgruppen
- UI‑Guidelines: Responsiv bis 320 px, klare Fehlermeldungen, keine Console‑Errors

---

## Aktuelle Sprint‑Vorgaben (Stand 2025‑12‑04)

- Sprint 1 Fokus: Kontakte End‑to‑End (Liste, Detail, Erstellen, Bearbeiten, Löschen)
- Firebase/Firestore mit realistischen Dummy‑Daten und konsistentem Mehrnutzer‑Zugriff
- Klare Validierungen und Fehlermeldungen; Loading‑States; Buttons während Requests deaktiviert
- Responsiv bis 320 px; keine Console‑Errors; saubere, modulare Code‑Struktur
- Definition of Done anwenden; Pull Requests mit kurzer Beschreibung und Screenshots
- Daily um 09:30 (kurze Abstimmung); Ad‑hoc‑Syncs bei Bedarf

---

## Screenshots

Die folgenden Screens zeigen aktuelle UI‑Stände aus Figma. Details zur Interaktion, Validierungen und States sollten beim Umsetzen gespiegelt werden. Die Bilder findest du unterhalb dieser README auf der Seite.

- Übersichtsliste
    
    ![Bildschirmfoto 2025-12-04 um 17.26.11.png](attachment:e42f75bd-6d8d-4db5-8560-bec856b07163:Bildschirmfoto_2025-12-04_um_17.26.11.png)
    
- Detailansicht zum „Hinzufügen/Bearbeiten“
    
    ![Bildschirmfoto 2025-12-04 um 17.25.59.png](attachment:18151daf-b688-487a-a416-88552d33c79a:Bildschirmfoto_2025-12-04_um_17.25.59.png)
    
- Boardansicht
    
    ![Bildschirmfoto 2025-12-04 um 17.23.54.png](attachment:9a5d9af8-bd0b-4765-b52c-5cf08a9fc8a9:Bildschirmfoto_2025-12-04_um_17.23.54.png)
    
- Kontaktbuch
    
    ![Bildschirmfoto 2025-12-04 um 17.24.12.png](attachment:0c6c3ca1-14c5-4bec-b8a2-a6e68257e7df:Bildschirmfoto_2025-12-04_um_17.24.12.png)
    

> Tipp: Ergänze zu jedem Screen in Zukunft eine kurze Bildunterschrift mit Zweck, wichtigen Komponenten und Edge Cases.
> 

---

## Features

- Kontakte: Auflisten, Details, Erstellen, Bearbeiten, Löschen
- Formularvalidierung mit klaren Fehlermeldungen
- Benutzerfeedback: Loading‑States, Disabled‑Buttons während Requests
- Tastatur‑ und Screenreader‑freundliche Interaktionen

Optional für spätere Sprints:

- Suche und Filter
- Paginierung oder virtuelle Liste bei großen Datenmengen
- Rollen/Gäste mit eingeschränkten Rechten

---

## Technischer Stack

- Frontend: Angular mit RxJS
- Backend/DB: Firebase (Firestore), AngularFire
- Tooling: npm, TypeScript, SCSS
- Design: Figma als UI‑Quelle

---

## Installation

```bash
# Node-Version prüfen (z. B. via nvm)
node -v

# Abhängigkeiten installieren
npm ci
```

Falls Angular CLI noch nicht global installiert ist:

```bash
npm i -g @angular/cli
```

### Repository klonen (Terminal)

Angenommen, die IDE‑Startseite ist geschlossen und du arbeitest nur im Terminal:

```bash
# In ein Arbeitsverzeichnis wechseln
cd ~/Projects

# Repo klonen (URL anpassen)
git clone <REPO_URL>

# In das Projektverzeichnis wechseln
cd <REPO_ORDNERNAME>

# Optional: Sicherstellen, dass du auf main bist
git branch -a
git switch main  # oder: git checkout main (ältere Git-Version)

# Abhängigkeiten installieren
npm ci
```

Hinweise, um NICHT versehentlich einen neuen Branch zu erstellen:

- Verwende "git switch main" statt in der IDE auf "Neuen Branch" zu klicken.
- Prüfe mit "git status" und "git branch" deine aktuelle Branch‑Position, bevor du Änderungen machst.
- Ziehe aktuelle Änderungen mit:

```bash
git fetch origin
git pull origin main
```

- Wenn die Standardbranch "main" heißt, nicht "master" verwenden. Bei abweichendem Namen entsprechend anpassen.
- In der IDE: Beim Öffnen des Ordners keinen Wizard nutzen, der automatisch einen neuen Branch (z. B. "feature/") vorschlägt.

---

## Entwicklung

```bash
# Dev-Server starten
npm start
# oder
ng serve --open
```

Richtlinien:

- Funktionslänge klein halten, verständliche Namen
- Keine Console‑Errors oder ungenutzte Variablen
- Reaktive Patterns mit RxJS, Subscriptions sauber aufräumen

---

## Tests

```bash
# Unit-Tests ausführen
npm test

# Linting
npm run lint
```

> Ergänze bei Verfügbarkeit E2E‑Tests und deren Startbefehle.
> 

---

## Build und Deployment

```bash
# Produktionsbuild
npm run build
# oder
ng build --configuration production
```

Deployment‑Hinweise:

- SPA‑Fallback konfigurieren (z. B. via .htaccess), damit Deep‑Links funktionieren
- Umgebungsvariablen für Prod getrennt pflegen

---

## Ordnerstruktur

Aktueller Stand und empfohlene Zielstruktur. Die Vorschläge orientieren sich am Angular Style Guide, feature‑first Architektur, Presentational vs. Container Components und typischen Setups mit Firebase/AngularFire.

```
├─ public/
│  ├─ fonts/
│  ├─ img/
│  └─ favicon.ico
├─ src/
│  ├─ app/
│  │  ├─ core/                               # App‑weite Singletons, Guards, Interceptors, Config
│  │  │  ├─ guards/
│  │  │  ├─ interceptors/
│  │  │  ├─ services/
│  │  │  │  ├─ http.service.ts
│  │  │  │  └─ auth.service.ts               # optional, falls Auth kommt
│  │  │  └─ config/
│  │  │     └─ firebase.config.ts            # zentrale Firebase/AngularFire Provider
│  │  ├─ shared/                             # Reine UI‑Bausteine und Utilities (ohne Geschäftslogik)
│  │  │  ├─ components/                      # Presentational Components (Inputs/Outputs)
│  │  │  │  ├─ button/
│  │  │  │  └─ input/
│  │  │  ├─ directives/
│  │  │  ├─ pipes/
│  │  │  ├─ interfaces/                      # Globale DTOs/Typen, die mehrere Features nutzen
│  │  │  └─ ui/                              # Design‑Primitives, Tokens
│  │  ├─ layout/                             # Shell, Header, Navigation
│  │  │  ├─ header/
│  │  │  └─ navigation/
│  │  │     ├─ navigation.component.{html,scss,ts}
│  │  │     └─ navigation.config.ts
│  │  ├─ features/                           # Feature‑Module (lazy‑loadbar)
│  │  │  ├─ main-content/
│  │  │  │  ├─ main-content.component.{html,scss,ts}
│  │  │  ├─ contacts/                        # ehem. contact/
│  │  │  │  ├─ pages/
│  │  │  │  │  ├─ [contacts-list.page](http://contacts-list.page).{html,scss,ts}
│  │  │  │  │  └─ [contact-detail.page](http://contact-detail.page).{html,scss,ts}
│  │  │  │  ├─ components/
│  │  │  │  │  ├─ contact-form.component.{html,scss,ts}
│  │  │  │  │  └─ contact-card.component.{html,scss,ts}
│  │  │  │  ├─ services/
│  │  │  │  │  └─ contacts.service.ts        # Firestore‑Abstraktion via AngularFire
│  │  │  │  ├─ models/
│  │  │  │  │  └─ contact.model.ts
│  │  │  │  └─ testing/                      # Mocks/Stubs für Unit‑Tests
│  │  │  ├─ board/
│  │  │  │  ├─ [board.page](http://board.page).{html,scss,ts}
│  │  │  │  └─ components/
│  │  │  ├─ summary/
│  │  │  │  └─ [summary.page](http://summary.page).{html,scss,ts}
│  │  │  └─ add-task/
│  │  │     └─ [add-task.page](http://add-task.page).{html,scss,ts}
│  │  ├─ state/                              # optional, falls zentraler App‑State nötig ist
│  │  │  └─ app-store.ts                     # z. B. Component Store/Signals
│  │  ├─ app.component.{html,scss,ts}
│  │  ├─ app.routes.ts
│  │  └─ app.config.ts                       # bootstrapApplication, provideRouter, provideHttpClient
│  ├─ assets/
│  ├─ environments/
│  │  ├─ environment.ts
│  │  └─ [environment.prod](http://environment.prod).ts
│  ├─ styles/
│  │  ├─ _variables.scss                     # z. B. Font‑Größen, Farben, Spacing
│  │  └─ _mixins.scss
│  └─ styles.scss
```

Empfehlungen und Begründungen

- Feature‑First: Jede Domäne kapselt Pages, Components, Services, Models. Vereinfachtes Ownership, sauberes Lazy Loading, kurze Importwege.
- Core vs. Shared: Core für Singletons und Infrastruktur. Shared für presentational components und Utilities ohne Domänenlogik.
- Namenskonvention: Einheitlich .component.ts, .page.ts, .service.ts, .model.ts. Verbessert Lesbarkeit und Tooling.
- Services pro Feature: Kontakte‑Logik in contacts.service.ts; UI bleibt dünn und reaktiv (Observables, AsyncPipe, takeUntil).
- Layout separat: Shell, Header, Navigation als eigene Ebene. Navigation per Config statt Hardcoding.
- Testing nahe am Feature: testing/ je Feature für Mocks/Stubs und Harnesses.
- Optionaler state/: Erst einführen, wenn nötig. Bei wachsender Komplexität z. B. Component Store oder Signals einsetzen.
- Styles/Tokens: Design‑Tokens in _variables.scss, Patterns in _mixins.scss. Globale styles.scss minimal halten.
- Environments: Firebase‑Keys strikt über environments; keine Secrets im Repo.

Branchenübliche Patterns/Referenzen

- Angular Style Guide: Feature‑Module, klare Suffixe, Core/Shared‑Trennung.
- Presentational/Container Pattern: Wiederverwendbarkeit und Testbarkeit.
- Lazy Loading je Feature: Bessere Performance, klare Boundaries.
- Datenzugriff kapseln: Firestore/HTTP nur in Services, nicht in Components.

Nächste sinnvolle Ergänzungen

- guards/ auf Feature‑Ebene, wenn AuthZ/Navigation abhängig ist
- error‑handling/ und logging/ in core/interceptors/
- analytics/ Service in core/services/ (optional)
- i18n/ Struktur, falls Mehrsprachigkeit geplant ist

## Konfiguration und Umgebungsvariablen

Lege Firebase‑Konfigurationen in environments/ ab.

Beispiel keys in environment.ts:

```tsx
export const environment = {
  production: false,
  firebase: {
    apiKey: '...',
    authDomain: '...',
    projectId: '...',
    storageBucket: '...',
    messagingSenderId: '...',
    appId: '...'
  }
};
```

Sensible Werte niemals committen. Für CI/CD sichere Secrets nutzen.

---

## Qualität und Sicherheit

- Barrierefreiheit: Labels, ARIA‑Attribute, Fokusmanagement
- Performance: OnPush wo sinnvoll, asynchrone Pipes, Lazy Loading
- Sicherheit: Eingaben validieren, nur minimal nötige Firestore‑Regeln
- Code‑Review: Pull Requests mit klarer Beschreibung und Screens

---

## Roadmap

1. Kontakte‑MVP abschließen inklusive Validierung und Tests
2. Suche und Filter hinzufügen
3. Authentifizierung und Rollen
4. Optimierungen für Performance und Barrierefreiheit

---

## Lizenz

Gib hier die verwendete Lizenz oder interne Nutzungsbedingungen an.
