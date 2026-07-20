import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyTable } from './empty-table';

describe('EmptyTable', () => {
  let component: EmptyTable;
  let fixture: ComponentFixture<EmptyTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyTable],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
