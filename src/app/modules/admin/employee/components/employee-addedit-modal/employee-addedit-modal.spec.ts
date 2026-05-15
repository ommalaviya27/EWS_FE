import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAddeditModal } from './employee-addedit-modal';

describe('EmployeeAddeditModal', () => {
  let component: EmployeeAddeditModal;
  let fixture: ComponentFixture<EmployeeAddeditModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeAddeditModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeAddeditModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
