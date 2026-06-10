import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerTheDelegate } from './explorer-the-delegate';

describe('ExplorerTheDelegate', () => {
  let component: ExplorerTheDelegate;
  let fixture: ComponentFixture<ExplorerTheDelegate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerTheDelegate],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerTheDelegate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
