import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { myTanksPage } from './myTanks.page';

describe('Tab5Page', () => {
  let component: myTanksPage;
  let fixture: ComponentFixture<myTanksPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [myTanksPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(myTanksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
