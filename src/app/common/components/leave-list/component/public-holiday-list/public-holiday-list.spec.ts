import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicHolidayList } from './public-holiday-list';

describe('PublicHolidayList', () => {
  let component: PublicHolidayList;
  let fixture: ComponentFixture<PublicHolidayList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicHolidayList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicHolidayList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
