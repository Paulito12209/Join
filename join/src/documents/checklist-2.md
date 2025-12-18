## **1. Kanbanboard & Taskmanagement**

### **User Story 1**

Als Benutzer möchte ich verschiedene Tasks auf einem Kanban-Board angezeigt bekommen.

- [ ]  Das Board hat ein Layout mit vier Spalten: ToDo, In Progress, Awaiting Feedback und Done.

- [ ]  Wenn eine Spalte ohne Tasks steht hier eine Info, dass keine Tasks in dem jeweiligen Status sich befinden
    
- [ ]  Jeder Task zeigt Kategorie, Titel, eine Vorschau der Beschreibung, alle zugewiesenen Benutzer mit Initialen und die Priorität des Tasks.
    
- [ ]  Ich kann die vollständige Beschreibung und alle Infos zu einem Tasks anzeigen, wenn ich auf einen Task klicke.
    
- [ ]  Es gibt ein "+"-Icon in jeder Spalte außer der Kategorie “Done”, dass das Hinzufügen eines neuen Tasks ermöglicht.
    

### **User Story 2**

Als Benutzer möchte ich den Fortschritt von Tasks, die Subtasks enthalten, auf dem Kanban-Board visualisiert sehen, um einen Überblick über den aktuellen Stand der Aufgaben zu haben.

- [ ]  Jeder Task, der Subtasks enthält, zeigt eine Fortschrittsanzeige oder ein Balkendiagramm.
    
- [ ]  Die Fortschrittsanzeige zeigt die Anzahl der erledigten Subtasks im Verhältnis zur Gesamtzahl der Subtasks.
    
- [ ]  Bei vollständig abgeschlossenen Tasks mit allen erledigten Subtasks wird der Fortschrittsbalken als voll dargestellt.
    
- [ ]  Durch Hover oder Klick auf die Fortschrittsanzeige erhält der Benutzer eine detaillierte Übersicht, z.B. "5 von 7 Subtasks erledigt".
    
### **User Story 3**

Als Benutzer möchte ich eine Suchfunktion nutzen können, um spezifische Tasks anhand ihres Titels auf dem Kanban-Board schnell zu finden.

- [ ]  Es gibt ein Suchfeld oder eine Suchleiste auf dem Kanban-Board.
    
- [ ]  Bei Eingabe eines Suchbegriffs werden die Ergebnisse in Echtzeit gefiltert und angezeigt.
    
- [ ]  Nur Tasks, deren Titel oder Beschreibung den eingegebenen Suchbegriff enthält, werden in den Suchergebnissen angezeigt.
    
- [ ]  Bei einer leeren Suchanfrage oder beim Löschen des Suchbegriffs werden alle Tasks wieder angezeigt.
    
- [ ]  Ein Hinweis oder eine Meldung wird angezeigt, wenn keine Tasks den Suchkriterien entsprechen, z.B. "Keine Ergebnisse gefunden".
    

### **User Story 4**

Als Benutzer möchte ich Tasks auf verschiedene Weise intuitiv hinzufügen können und dabei alle notwendigen Details angeben, um die Arbeit effizient und organisiert auf dem Kanban-Board darzustellen. Neben der für sich stehenden Add Task-Seite gibt es dafür eine weitere Möglichkeit direkt im Board:

- [ ]  Es gibt eine "Add Task"-Option im Hauptmenü der Anwendung.
    
- [ ]  Jede Spalte auf dem Kanban-Board hat ein "+"-Icon, durch das direkt ein neuer Task zur jeweiligen Spalte hinzugefügt werden kann. Der jeweilige Status der Spalte wird dem neuen Task direkt hinzugefügt
    
- [ ]  Neben der Suchleiste befindet sich ein weiteres "Add Task"-Symbol, über das ein neues Task-Formular aufgerufen werden kann.
    
- [ ]  Beim Klicken auf eines dieser Symbole oder Optionen öffnet sich ein Formular mit folgenden Eingabefeldern:
    
    - [ ]  **Titel ***: Ein Pflichtfeld, in das der Name des Tasks eingegeben wird.
        
    - [ ]  **Beschreibung**: Ein optionaler Input, um weitere Informationen zum Task zu geben.
        
    - [ ]  **Fälligkeitsdatum (Due Date)*:** Um das geforderte Abschlussdatum des Tasks anzugeben.
        
    - [ ]  **Priorität**: Eine Auswahl mit den Optionen "urgent", "medium" und "low". Defaultwert: “Medium” ist per Default automatisch vorselektiert.
        
    - [ ]  **Zugewiesen an (Assigned to):** Ein Dropdown-Menü, um den verantwortlichen Benutzer oder das Teammitglied für den Task auszuwählen.
        
    - [ ]  **Kategorie*:** Ein Dropdown-Menü, um den Task einer bestimmten Kategorie zuzuweisen. Zur Auswahl an Kategorien stehen “Technical Tasks” und “User Story”.
        
- [ ]  (*) Es muss der Titel, ein Fälligkeitsdatum, dass nicht in der Vergangenheit liegen darf und eine Kategorie ausgefüllt werden, um einen Task speichern zu können.

### **User Story 5:**

Als Benutzer möchte ich Subtasks zu den Hauptaufgaben hinzufügen, bearbeiten und organisieren können, um die Aufgaben detaillierter zu strukturieren und den Fortschritt besser nachverfolgen zu können.

- [ ]  Im Task-Formular gibt es einen speziellen Abschnitt mit einem Eingabefeld für Subtasks.
    
- [ ]  Bei Fokus auf dem Subtaskfeld wird durch Drücken der Eingabetaste oder durch Klicken das Häkchen-Symbol der eingegebene Subtask zur Liste der Subtasks für diese Hauptaufgabe hinzugefügt. Ein "X"-Symbol im Eingabefeld dient zum Zurücksetzen des Eingabefeldes, ohne einen Subtask hinzuzufügen.
    
- [ ]  Nach dem Hinzufügen eines Subtasks wird das Eingabefeld automatisch geleert und steht für die Eingabe eines weiteren Subtasks bereit.
    
- [ ]  Beim Überfahren (Hover) eines Subtasks mit der Maus werden ein Stift-Icon und ein "X"-Icon sichtbar.
    
    -  Das Stift-Icon ermöglicht es den Benutzern, den Titel eines bestehenden Subtasks zu bearbeiten.
    
    -  Das "Mülleimer"-Symbol ermöglicht es, einen bereits hinzugefügten Subtask zu löschen.
        

### **User Story 6:**

Als Benutzer möchte ich die Möglichkeit haben, bestehende Tasks zu bearbeiten oder zu löschen, indem ich deren Detailansicht aufrufe, um Änderungen vorzunehmen oder nicht mehr benötigte Tasks zu entfernen.

- [ ]  Ein Klick auf einen Task öffnet seine Ticketdetails-Ansicht.
    
- [ ]  In der Ticketdetails-Ansicht gibt es eine Editieroption mit einem Stift-Icon, um den Bearbeitungsmodus zu aktivieren.
    
- [ ]  Im Bearbeitungsmodus können alle Details des Tasks, wie z.B. Titel, Beschreibung, Fälligkeitsdatum, Priorität, Zugeordnete und Subtasks geändert werden.
    
- [ ]  In der Ticketdetails-Ansicht gibt es auch ein Papierkorb-Icon, um den Task dauerhaft zu entfernen. Bei Klick wird der Task gelöscht und nicht mehr auf dem Kanban-Board angezeigt.

### **User Story 7:**

Als Benutzer möchte ich die Möglichkeit haben, Tasks per Drag & Drop zwischen den Spalten zu verschieben – sowohl auf Desktop- als auch auf Mobilgeräten – um den Status eines Tasks einfach und intuitiv zu aktualisieren.

- [ ]  Jeder Task ist “greifbar”, um ihn zwischen den Spalten zu verschieben.
    
- [ ]  Während des Drag-Vorgangs wird eine visuelle Rückmeldung angezeigt, die dem Benutzer signalisiert, dass der Task bewegt wird. z.B leichte Drehung der Karte
    
- [ ]  Das Loslassen des Tasks in einer Spalte platziert ihn in dieser Spalte und aktualisiert seinen Status entsprechend.
    
- [ ]  Das Verschieben eines Tasks in eine neue Spalte sollte flüssig und ohne Verzögerung erfolgen.
    
- [ ]  Nachdem ein Task in eine neue Spalte verschoben wurde, bleibt er an dieser Position, bis er erneut verschoben oder anderweitig aktualisiert wird.
    
- [ ]  Jede Spalte auf dem Kanban-Board signalisiert visuell, dass sie einen Task aufnehmen kann, indem eine gestrichelte Box (dashed box) erscheint, wenn ein Task über sie gezogen wird (highlight).
    
- [ ]  Auf Mobilgeräten werden die Spalten vertikal angeordnet dargestellt.
    
- [ ]  Die Touch-Funktionalität muss auf mobilen Geräten nicht zwingend unterstützt werden, da die Umsetzung unter Safari problematisch sein kann. ***Lösungsvorschlag:*** Ein kleiner Pfeil in der oberen rechten Ecke öffnet ein Popup-Menü, über das der Nutzer auswählen kann, wohin der Task verschoben werden soll.
    
## **2. Immer zu berücksichtigen**

### **Allgemein**

- [ ]  Alle User Stories und Akzeptanzkriterien sind erfüllt.
    
- [ ]  Alle Features funktionieren fehlerfrei und wie erwartet.
    
- [ ]  Vor Abgabe werden mindestens 5 seriöse Tasks hinzugefügt (Dummy-Daten).
    
- [ ]  Alle Funktionalitäten wurden vor Abgabe von den Gruppenmitgliedern manuell getestet mit den aktuellsten Versionen der Hauptbrowser (Chrome, Firefox, Edge, wenn möglich auch Safari).
    
### **User Experience**

- [ ]  User erhält intuitiv Feedback bei Interaktionen (hover, toast-messages etc.)
    
- [ ]  Alle UI-Elemente (Farben, Abstände, Schatten) entsprechen dem Design-Prototypen in Figma.
    
- [ ]  Transitions auf anklickbaren Elementen liegen zwischen 75ms und 125ms.
    
- [ ]  Join funktioniert auf mobilen Geräten und unterstützt vertikale Anordnung der Kanban-Spalten.
    
- [ ]  Buttons haben die CSS Eigenschaft cursor: pointer; Inputs und Buttons haben keinen Standard-Border (Besser border: unset;);    

### **Technische Anforderungen**

- [ ]  Join hat eine SPA-Architektur (Single-Page-Application)
    
- [ ]  Dateinamen
    
    - beschreibend / aussagekräftig
        
    - konsistent
        
- [ ]  Es gibt keine Fehlermeldungen oder logs in der Konsole
    

### **Design**

- [ ]  Haben Buttons die CSS Eigenschaft cursor: pointer; ?
    
- [ ]  Inputs und Buttons haben keinen Standard-Border (Besser border: unset;);
    

### **Responsiveness**

- [ ]  Jede Seite funktioniert bei jeder Auflösung bis min. 320px (Fenster kleiner ziehen)
    
- [ ]  Jede Seite funktioniert sowohl mobile als auch auf Desktop
    
- [ ]  Content-Begrenzung für große Monitore (max-width bei 1440px / linksbündig)
    
    → gilt nicht für Design-Elemente
    
- [ ]  Keine horizontalen Scrollbalken bei kleineren Auflösungen
    

### **Formulare**

- [ ]  Verwende eine Form Validation
    
- [ ]  Orientiere dich am Figma, keine HTML5-Standardvalidation verwenden
    
- [ ]  Button deaktivieren während der Ladezeit
    
- [ ]  Assigned-to Feld
    
  - [ ]  Das Drop-Down Menü muss sich wieder automatisch schließen, wenn neben das Drop-Down Menü geklickt wird
    
  **Hinweis:** In diesem Feld sollten **Kontakte** ausgewählt werden können. Somit können potentielle Arbeitgeber deine Software deutlich besser testen, als wenn hier User ausgewählt werden.
    
- [ ]  Subtask-Feld
    
  - [ ]  Wenn **innerhalb** von dem Subtask-Feld auf Enter gedrückt wird, muss ein Subtask angelegt werden. Der Haupt-Task darf **nicht** erstellt werden.
        

### **JavaScript / Clean Code**

- [ ]  Eine Funktion hat nur eine Aufgabe
            
- [ ]  Eine Funktion ist maximal 14 Zeilen lang (HTML ausgenommen)
    
- [ ]  Deutliche Funktionsnamen
    
- [ ]  Geschrieben in camelCase (Richtig: shoppingCart, falsch; Shopping_Cart) für Dateinamen, Variablen und Funktionen
    
- [ ]  Der erste Buchstabe von Funktionen / Variablen ist **klein geschrieben**
    
- [ ]  1 oder 2 Leerzeilen Abstand zwischen Funktionen (Konsistent bleiben!)
    
- [ ]  Max 400 LOCs (Lines of Code) pro Datei
    
- [ ]  Dateien sind richtig benannt: index.html, script.js, style.css
    
- [ ]  Ggf. HTML Code in extra Funktion
    
- [ ]  Extra Ordner für templates und Bilder (z.B. img, assets)
    
- [ ]  Statischer HTML Code wird **nicht** über JavaScript generiert
    
- [ ]  Funktionen sind nach JSDoc Standard dokumentiert: https://jsdoc.app/about-getting-started.html
    
### **Vermeide diese häufigen Fehler**

- [ ]  Tickets verschwinden, wenn ich sie in eine andere Spalte ziehe
    
- [ ]  Kein User-Feedback, wenn etwas gespeichert / geändert wird
    
- [ ]  Columns in der Board-Übersicht gehen zu weit runter
    
- [ ]  “rauslaufen” von Subtasks, Kontakten und allgemeiner Content
    
- [ ]  verwenden von alerts/HTML5 in der Form Validation