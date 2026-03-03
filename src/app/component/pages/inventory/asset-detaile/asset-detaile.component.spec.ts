import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetDetaileComponent } from './asset-detaile.component';

describe('AssetDetaileComponent', () => {
  let component: AssetDetaileComponent;
  let fixture: ComponentFixture<AssetDetaileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetDetaileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetDetaileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
