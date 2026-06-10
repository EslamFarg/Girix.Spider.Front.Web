import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddScrap } from './add-scrap';

describe('AddScrap', () => {
  let component: AddScrap;
  let fixture: ComponentFixture<AddScrap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddScrap],
    }).compileComponents();

    fixture = TestBed.createComponent(AddScrap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
