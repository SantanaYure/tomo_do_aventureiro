import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterView } from './character-view';

describe('CharacterView', () => {
  let component: CharacterView;
  let fixture: ComponentFixture<CharacterView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
