import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionNav } from './section-nav';

describe('SectionNav', () => {
  let component: SectionNav;
  let fixture: ComponentFixture<SectionNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
