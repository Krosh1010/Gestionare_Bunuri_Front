import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoveragestatusComponent } from './coveragestatus.component';

describe('CoveragestatusComponent', () => {
  let component: CoveragestatusComponent;
  let fixture: ComponentFixture<CoveragestatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoveragestatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoveragestatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
