import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailModel } from './task-detail-model';

describe('TaskDetailModel', () => {
  let component: TaskDetailModel;
  let fixture: ComponentFixture<TaskDetailModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskDetailModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
