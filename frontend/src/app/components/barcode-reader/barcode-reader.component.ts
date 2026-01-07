import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-barcode-reader',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule],
  templateUrl: './barcode-reader.component.html',
  styleUrls: ['./barcode-reader.component.scss']
})
export class BarcodeReaderComponent {
  @Output() scanned = new EventEmitter<string>();

  allowedFormats = [BarcodeFormat.CODE_128];

  cameras: MediaDeviceInfo[] = [];
  currentDevice?: MediaDeviceInfo;

  onCamerasFound(devices: MediaDeviceInfo[]) {
    this.cameras = devices;

    // tenta priorizar webcam (não celular)
    const webcam = devices.find(d =>
      !d.label.toLowerCase().includes('virtual') &&
      !d.label.toLowerCase().includes('phone') &&
      !d.label.toLowerCase().includes('cell')
    );

    this.currentDevice = webcam || devices[0];
  }

onDeviceSelect(target: EventTarget | null) {
  if (!target) return;

  const select = target as HTMLSelectElement;
  const deviceId = select.value;

  this.currentDevice = this.cameras.find(
    d => d.deviceId === deviceId
  );
}

  onCodeResult(result: string) {
    console.log('Barcode lido:', result);
    this.scanned.emit(result);
  }
}