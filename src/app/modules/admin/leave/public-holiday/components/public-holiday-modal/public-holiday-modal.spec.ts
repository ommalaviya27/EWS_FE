import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicHolidayModal } from './public-holiday-modal';

describe('PublicHolidayModal', () => {
  let component: PublicHolidayModal;
  let fixture: ComponentFixture<PublicHolidayModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicHolidayModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicHolidayModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
