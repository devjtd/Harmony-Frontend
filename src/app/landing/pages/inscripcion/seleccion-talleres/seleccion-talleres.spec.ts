import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionTalleres } from './seleccion-talleres';

describe('SeleccionTalleres', () => {
  let component: SeleccionTalleres;
  let fixture: ComponentFixture<SeleccionTalleres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionTalleres]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionTalleres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
