import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogBoard } from './dialog-board';

describe('DialogBoard', () => {
  let component: DialogBoard;
  let fixture: ComponentFixture<DialogBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogBoard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogBoard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
