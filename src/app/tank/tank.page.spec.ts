import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TankPage } from './tank.page';

describe('TankPage', () => {
  let component: TankPage;
  let fixture: ComponentFixture<TankPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TankPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TankPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
