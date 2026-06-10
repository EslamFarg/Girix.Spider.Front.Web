import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageHeaderSearch } from './page-header-search';

describe('PageHeaderSearch', () => {
  let component: PageHeaderSearch;
  let fixture: ComponentFixture<PageHeaderSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderSearch],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeaderSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
