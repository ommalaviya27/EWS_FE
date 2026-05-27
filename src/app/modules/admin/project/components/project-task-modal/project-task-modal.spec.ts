import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTaskModal } from './project-task-modal';

describe('ProjectTaskModal', () => {
  let component: ProjectTaskModal;
  let fixture: ComponentFixture<ProjectTaskModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTaskModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTaskModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
