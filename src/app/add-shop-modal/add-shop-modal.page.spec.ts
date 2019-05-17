import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddShopModalPage } from './add-shop-modal.page';

describe('AddShopModalPage', () => {
  let component: AddShopModalPage;
  let fixture: ComponentFixture<AddShopModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddShopModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddShopModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
