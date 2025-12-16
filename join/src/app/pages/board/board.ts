import { Component } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from "@angular/cdk/drag-drop";
import { TasksService } from '../../core/services/tasks.service';
import { CommonModule } from '@angular/common';
import { ContactsService } from '../../core/services/contacts.service';

@Component({
  selector: "app-board",
  imports: [CdkDropList, CdkDrag, CommonModule],
  templateUrl: "./board.html",
  styleUrl: "./board.scss",
})
export class Board {
  todo = ["Wenn eine Spalte ohne Tasks steht hier eine Info, dass keine Tasks in dem jeweiligen Status sich befinden", "Jeder Task zeigt Kategorie, Titel, eine Vorschau der Beschreibung, alle zugewiesenen Benutzer mit Initialen und die Priorität des Tasks.", "Ich kann die vollständige Beschreibung und alle Infos zu einem Tasks anzeigen, wenn ich auf einen Task klicke."];
  progress = [
    "Das Board hat ein Layout mit vier Spalten: ToDo, In Progress, Awaiting Feedback und Done.",
    "Es gibt ein '+'-Icon in jeder Spalte außer der Kategorie “Done”, dass das Hinzufügen eines neuen Tasks ermöglicht.",
  ];
  feedback = [
    "Platzhalter Feedback",
  ];
  done = ["Platzhalter Done"];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
}
