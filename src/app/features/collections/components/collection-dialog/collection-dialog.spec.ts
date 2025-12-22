import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionDialog } from './collection-dialog';

describe('CollectionDialog', () => {
  let component: CollectionDialog;
  let fixture: ComponentFixture<CollectionDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
