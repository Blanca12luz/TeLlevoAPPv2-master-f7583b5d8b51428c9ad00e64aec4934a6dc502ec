import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearViajesPage } from './crear-viajes.page';

describe('CrearViajesPage', () => {
  let component: CrearViajesPage;
  let fixture: ComponentFixture<CrearViajesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearViajesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
