import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamAttendanceGrid } from './team-attendance-grid';

describe('TeamAttendanceGrid', () => {
  let component: TeamAttendanceGrid;
  let fixture: ComponentFixture<TeamAttendanceGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamAttendanceGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamAttendanceGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
