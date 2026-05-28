import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskViewModal } from './task-view-modal';

describe('TaskViewModal', () => {
  let component: TaskViewModal;
  let fixture: ComponentFixture<TaskViewModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskViewModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskViewModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
