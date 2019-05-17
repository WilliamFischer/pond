import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopDetailModelPage } from './shop-detail-model.page';

describe('ShopDetailModelPage', () => {
  let component: ShopDetailModelPage;
  let fixture: ComponentFixture<ShopDetailModelPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopDetailModelPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopDetailModelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
