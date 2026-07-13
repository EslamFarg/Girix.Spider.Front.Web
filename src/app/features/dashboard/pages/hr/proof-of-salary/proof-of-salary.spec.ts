import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProofOfSalary } from './proof-of-salary';

describe('ProofOfSalary', () => {
  let component: ProofOfSalary;
  let fixture: ComponentFixture<ProofOfSalary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProofOfSalary],
    }).compileComponents();

    fixture = TestBed.createComponent(ProofOfSalary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
