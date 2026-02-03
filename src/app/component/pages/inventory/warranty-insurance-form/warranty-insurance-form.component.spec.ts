import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarrantyInsuranceFormComponent } from './warranty-insurance-form.component';

describe('WarrantyInsuranceFormComponent', () => {
  let component: WarrantyInsuranceFormComponent;
  let fixture: ComponentFixture<WarrantyInsuranceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarrantyInsuranceFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarrantyInsuranceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
