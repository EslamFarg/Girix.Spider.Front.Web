import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerScrap } from './explorer-scrap';

describe('ExplorerScrap', () => {
  let component: ExplorerScrap;
  let fixture: ComponentFixture<ExplorerScrap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerScrap],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerScrap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
