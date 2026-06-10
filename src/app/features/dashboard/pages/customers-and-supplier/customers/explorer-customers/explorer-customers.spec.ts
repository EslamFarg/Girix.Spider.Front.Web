import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerCustomers } from './explorer-customers';

describe('ExplorerCustomers', () => {
  let component: ExplorerCustomers;
  let fixture: ComponentFixture<ExplorerCustomers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerCustomers],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerCustomers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
