import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerInternalExchangePermit } from './explorer-internal-exchange-permit';

describe('ExplorerInternalExchangePermit', () => {
  let component: ExplorerInternalExchangePermit;
  let fixture: ComponentFixture<ExplorerInternalExchangePermit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerInternalExchangePermit],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerInternalExchangePermit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
