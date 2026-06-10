import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerDeliveryGoods } from './explorer-delivery-goods';

describe('ExplorerDeliveryGoods', () => {
  let component: ExplorerDeliveryGoods;
  let fixture: ComponentFixture<ExplorerDeliveryGoods>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerDeliveryGoods],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerDeliveryGoods);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
