import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTankSubstratePage } from './select-tank-substrate.page';

describe('SelectTankSubstratePage', () => {
  let component: SelectTankSubstratePage;
  let fixture: ComponentFixture<SelectTankSubstratePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectTankSubstratePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectTankSubstratePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
