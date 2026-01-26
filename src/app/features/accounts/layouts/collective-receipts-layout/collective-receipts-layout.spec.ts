import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectiveReceiptsLayout } from './collective-receipts-layout';

describe('CollectiveReceiptsLayout', () => {
  let component: CollectiveReceiptsLayout;
  let fixture: ComponentFixture<CollectiveReceiptsLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectiveReceiptsLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectiveReceiptsLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
