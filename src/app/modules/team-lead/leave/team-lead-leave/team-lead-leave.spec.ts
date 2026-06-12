import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamLeadLeave } from './team-lead-leave';

describe('TeamLeadLeave', () => {
  let component: TeamLeadLeave;
  let fixture: ComponentFixture<TeamLeadLeave>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamLeadLeave]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamLeadLeave);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
