import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersLayout } from './customers-layout';

describe('CustomersLayout', () => {
  let component: CustomersLayout;
  let fixture: ComponentFixture<CustomersLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomersLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
