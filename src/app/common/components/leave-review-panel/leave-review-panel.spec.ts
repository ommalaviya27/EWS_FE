import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveReviewPanel } from './leave-review-panel';

describe('LeaveReviewPanel', () => {
  let component: LeaveReviewPanel;
  let fixture: ComponentFixture<LeaveReviewPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveReviewPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveReviewPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
