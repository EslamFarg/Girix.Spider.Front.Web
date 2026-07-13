import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExplorerProofOfSalary } from './explorer-proof-of-salary';

describe('ExplorerProofOfSalary', () => {
  let component: ExplorerProofOfSalary;
  let fixture: ComponentFixture<ExplorerProofOfSalary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerProofOfSalary],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerProofOfSalary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
