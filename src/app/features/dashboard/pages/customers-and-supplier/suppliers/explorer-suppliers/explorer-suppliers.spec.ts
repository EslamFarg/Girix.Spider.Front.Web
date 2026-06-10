import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerSuppliers } from './explorer-suppliers';

describe('ExplorerSuppliers', () => {
  let component: ExplorerSuppliers;
  let fixture: ComponentFixture<ExplorerSuppliers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerSuppliers],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerSuppliers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
