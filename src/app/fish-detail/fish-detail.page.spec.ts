import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FishDetailPage } from './fish-detail.page';

describe('FishDetailPage', () => {
  let component: FishDetailPage;
  let fixture: ComponentFixture<FishDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FishDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FishDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
