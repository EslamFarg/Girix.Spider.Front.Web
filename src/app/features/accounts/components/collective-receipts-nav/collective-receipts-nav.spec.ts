import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectiveReceiptsNav } from './collective-receipts-nav';

describe('CollectiveReceiptsNav', () => {
  let component: CollectiveReceiptsNav;
  let fixture: ComponentFixture<CollectiveReceiptsNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectiveReceiptsNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectiveReceiptsNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
