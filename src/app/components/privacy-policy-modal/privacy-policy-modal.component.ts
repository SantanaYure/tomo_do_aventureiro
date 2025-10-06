import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-privacy-policy-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './privacy-policy-modal.component.html',
  styleUrls: ['./privacy-policy-modal.component.css'],
})
export class PrivacyPolicyModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() accept = new EventEmitter<boolean>();

  isAccepted: boolean = false;
  currentDate: string = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  closeModal() {
    this.close.emit();
  }

  confirmAcceptance() {
    this.accept.emit(this.isAccepted);
    this.close.emit();
  }
}
