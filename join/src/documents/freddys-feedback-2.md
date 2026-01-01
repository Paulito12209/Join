### AddTask - Responsive Design

- [ ]  Problem bei ca. 800 Pixel: Rechte Seite wird abgeschnitten
- [ ]  Problem bei ca. 300 Pixel: Clear Button läuft aus dem Bildschirm
- Ansonsten funktioniert Responsive bereits gut

### AddTask - Form Validation

- [ ]  Form Validation ist unterschiedlich zwischen AddTask und Board implementiert
- [ ]  Einheitliche Validierung implementieren - Variante vom Board bevorzugt (Button klickbar, zeigt dann fehlende Felder an)
    - [ ]  Bei AddTask ist der Button deaktiviert, bei Board kann man klicken und sieht dann fehlende Felder

### AddTask - Assign To Sektion

- [ ]  Personen sind zu weit auseinander (größere Lücke), sieht anders aus als im Board
- [ ]  Schließverhalten inkonsistent: Im Board schließt sich das Dropdown beim Klicken außerhalb, im AddTask nur beim Klicken auf den Pfeil
- [ ]  Spacing der Personen anpassen (näher beieinander wie im Mockup)
- [ ]  Schließverhalten vom Board übernehmen

### AddTask - Subtasks

- [x]  Inputfeld zentrieren
    - [x]  Inputfeld ist nicht mittig, sondern sehr weit unten positioniert
- [ ]  Editing-Funktion für Subtasks implementieren
    - [ ]  Subtasks können nicht editiert werden (Klick funktioniert nicht)
- [ ]  Scrollbar hinzufügen wenn mehrere Subtasks vorhanden sind

### AddTask - Button Positionierung & Due Date

- [ ]  Button-Positionierung korrigieren
    - [ ]  Clear Button und Create Task Button sind zu weit unten am Rahmen
- [ ]  Due Date auf zukünftige Termine beschränken
    - [ ]  Due Date erlaubt derzeit auch Termine in der Vergangenheit

### AddTask - Navigation

- [ ]  Navigation zum Board nach Task-Erstellung implementieren
    - [ ]  Nach Task-Erstellung fehlt Weiterleitung zum Board

### Board - Assigned Users Anzeige

- [x]  Bei vielen zugewiesenen Personen laufen die Avatare über
    - [x]  Funktioniert bis ca. 5 Personen, dann wird es problematisch
- [x]  Maximum von 3 Personen anzeigen, Rest als "+X" Badge darstellen

### Board - Drag & Drop

- [x]  Problem bei Responsive: Scrollen auf kleinen Bildschirmen ist schwierig
    - [x]  Beim Scrollen werden oft versehentlich Tasks gegriffen
    - [x]  Deutlich sichtbare Scrollbar für Responsive hinzufügen, wenn Verbesserung anders nicht möglich

### Board - Edit View

- [x]  Bestehende Werte für Due Date und Priority beim Editieren anzeigen
    - [x]  Due Date und Priority werden nicht angezeigt beim Editieren eines bestehenden Tasks
    - [x]  Task wird trotzdem gespeichert (wahrscheinlich mit alten Werten)
- [x]  Neue Inhalte können hinzugefügt werden

### Board - Task Checkbox

- [x]  Jumping-Verhalten beim Anhaken von Tasks beheben
    - [x]  Beim Anhaken von Tasks springt die Ansicht plötzlich nach oben