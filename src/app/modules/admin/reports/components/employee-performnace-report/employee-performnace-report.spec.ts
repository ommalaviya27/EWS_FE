import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePerformnaceReport } from './employee-performnace-report';

describe('EmployeePerformnaceReport', () => {
  let component: EmployeePerformnaceReport;
  let fixture: ComponentFixture<EmployeePerformnaceReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeePerformnaceReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePerformnaceReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
