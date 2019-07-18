import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainfishdetailPage } from './mainfishdetail.page';

describe('MainfishdetailPage', () => {
  let component: MainfishdetailPage;
  let fixture: ComponentFixture<MainfishdetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainfishdetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainfishdetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
