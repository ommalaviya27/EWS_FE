import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectProgressReport } from './project-progress-report';

describe('ProjectProgressReport', () => {
  let component: ProjectProgressReport;
  let fixture: ComponentFixture<ProjectProgressReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectProgressReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectProgressReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
