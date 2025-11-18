import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Contrasena } from './contrasena';

describe('Contrasena', () => {
  let component: Contrasena;
  let fixture: ComponentFixture<Contrasena>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contrasena]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Contrasena);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
