import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveApplyModel } from './leave-apply-modal';

describe('LeaveApplyModel', () => {
  let component: LeaveApplyModel;
  let fixture: ComponentFixture<LeaveApplyModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveApplyModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveApplyModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
