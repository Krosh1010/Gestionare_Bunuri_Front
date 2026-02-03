import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarrantyInsuranceSetingsComponent } from './warranty-insurance-setings.component';

describe('WarrantyInsuranceSetingsComponent', () => {
  let component: WarrantyInsuranceSetingsComponent;
  let fixture: ComponentFixture<WarrantyInsuranceSetingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarrantyInsuranceSetingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarrantyInsuranceSetingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
