import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneradorCalendarioComponent } from './generador-calendario.component';

describe('GeneradorCalendarioComponent', () => {
  let component: GeneradorCalendarioComponent;
  let fixture: ComponentFixture<GeneradorCalendarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneradorCalendarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneradorCalendarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
