import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskAddeditModal } from './task-addedit-modal';

describe('TaskAddeditModal', () => {
  let component: TaskAddeditModal;
  let fixture: ComponentFixture<TaskAddeditModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskAddeditModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskAddeditModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
