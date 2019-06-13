import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVariationModelPage } from './add-variation-model.page';

describe('AddVariationModelPage', () => {
  let component: AddVariationModelPage;
  let fixture: ComponentFixture<AddVariationModelPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddVariationModelPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddVariationModelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
