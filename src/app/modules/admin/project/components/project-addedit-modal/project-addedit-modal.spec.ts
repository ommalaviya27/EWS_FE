import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectAddeditModal } from './project-addedit-modal';

describe('ProjectAddeditModal', () => {
  let component: ProjectAddeditModal;
  let fixture: ComponentFixture<ProjectAddeditModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectAddeditModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectAddeditModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
