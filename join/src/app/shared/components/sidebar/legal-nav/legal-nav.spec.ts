import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalNav } from './legal-nav';

describe('LegalNav', () => {
  let component: LegalNav;
  let fixture: ComponentFixture<LegalNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
