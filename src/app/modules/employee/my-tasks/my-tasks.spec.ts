import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTasks } from './my-tasks';

describe('MyTasks', () => {
  let component: MyTasks;
  let fixture: ComponentFixture<MyTasks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyTasks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyTasks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
