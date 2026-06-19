import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicHoliday } from './public-holiday';

describe('PublicHoliday', () => {
  let component: PublicHoliday;
  let fixture: ComponentFixture<PublicHoliday>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicHoliday]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicHoliday);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
