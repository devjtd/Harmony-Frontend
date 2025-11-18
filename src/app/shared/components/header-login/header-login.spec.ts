import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderLogin } from './header-login';

describe('HeaderLogin', () => {
  let component: HeaderLogin;
  let fixture: ComponentFixture<HeaderLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
