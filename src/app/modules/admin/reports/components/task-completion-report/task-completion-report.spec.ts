import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCompletionReport } from './task-completion-report';

describe('TaskCompletionReport', () => {
  let component: TaskCompletionReport;
  let fixture: ComponentFixture<TaskCompletionReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCompletionReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskCompletionReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
