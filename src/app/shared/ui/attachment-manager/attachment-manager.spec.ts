import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentManager } from './attachment-manager';

describe('AttachmentManager', () => {
  let component: AttachmentManager;
  let fixture: ComponentFixture<AttachmentManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttachmentManager],
    }).compileComponents();

    fixture = TestBed.createComponent(AttachmentManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
