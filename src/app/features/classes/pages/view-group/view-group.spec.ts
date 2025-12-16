import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGroup } from './view-group';

describe('ViewGroup', () => {
  let component: ViewGroup;
  let fixture: ComponentFixture<ViewGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
