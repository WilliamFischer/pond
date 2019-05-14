import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TankDetailPage } from './tank-detail.page';

describe('TankDetailPage', () => {
  let component: TankDetailPage;
  let fixture: ComponentFixture<TankDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TankDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TankDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
