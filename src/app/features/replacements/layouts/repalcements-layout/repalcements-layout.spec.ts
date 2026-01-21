import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepalcementsLayout } from './repalcements-layout';

describe('RepalcementsLayout', () => {
  let component: RepalcementsLayout;
  let fixture: ComponentFixture<RepalcementsLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepalcementsLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepalcementsLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
