import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTransferBetweenRepositry } from './add-transfer-between-repositry';

describe('AddTransferBetweenRepositry', () => {
  let component: AddTransferBetweenRepositry;
  let fixture: ComponentFixture<AddTransferBetweenRepositry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTransferBetweenRepositry],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTransferBetweenRepositry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
