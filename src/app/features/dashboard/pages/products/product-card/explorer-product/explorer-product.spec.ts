import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerProduct } from './explorer-product';

describe('ExplorerProduct', () => {
  let component: ExplorerProduct;
  let fixture: ComponentFixture<ExplorerProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerProduct],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerProduct);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
