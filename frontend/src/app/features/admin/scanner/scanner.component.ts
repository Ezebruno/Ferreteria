// Scanner de códigos de barras para agregar productos rápidamente al POS
// Captura input de lectores de códigos y busca en inventario
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { LucideAngularModule, Camera, Scan, X } from "lucide-angular";
import { ApiService } from "src/app/core/services/api.service";

@Component({
  selector: "app-admin-scanner",
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="h-full flex flex-col bg-slate-800 text-white overflow-hidden relative">
      <!-- Background Effects -->
      <div class="absolute inset-0 z-0 pointer-events-none">
        <div class="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-red-600/5 rounded-full blur-[150px]"></div>
      </div>

      <!-- Header -->
      <div class="p-8 flex justify-between items-center bg-slate-800/40 backdrop-blur-xl border-b border-red-500/20 relative z-10 shadow-2xl">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/10">
            <lucide-icon [name]="Scan" size="24" class="text-red-500"></lucide-icon>
          </div>
          <div>
            <h1 class="text-xl font-black uppercase tracking-widest">Escáner de Inventario</h1>
            <p class="text-xs text-slate-500 font-bold">PROCESAMIENTO ÓPTICO EN TIEMPO REAL</p>
          </div>
        </div>
        <button class="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-all border border-red-500/30">
          <lucide-icon [name]="X" size="20" class="text-slate-400"></lucide-icon>
        </button>
      </div>

      <!-- Scanner Area -->
      <div class="flex-grow relative flex items-center justify-center p-8 z-10">
        <div
          class="w-full max-w-sm aspect-square bg-slate-800 rounded-[3rem] border-2 border-red-500/20 relative overflow-hidden group shadow-[0_0_80px_rgba(220,38,38,0.1)]"
        >
          <video
            #videoElement
            class="w-full h-full object-cover grayscale brightness-125"
            autoplay
            playsinline
          ></video>

          <!-- Scanning Animation -->
          <div class="absolute inset-0 pointer-events-none">
            <div
              class="w-full h-1 bg-red-500 shadow-[0_0_30px_rgba(220,38,38,1)] absolute top-0 animate-scan z-20"
            ></div>
            <div class="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent opacity-30"></div>
          </div>

          <!-- Corners Overlay -->
          <div class="absolute inset-0 border-[60px] border-slate-950/60 pointer-events-none"></div>
          <!-- Target Frame -->
          <div class="absolute inset-16 border-2 border-red-500/40 rounded-3xl pointer-events-none overflow-hidden">
             <div class="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500"></div>
             <div class="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500"></div>
             <div class="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500"></div>
             <div class="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500"></div>
          </div>
        </div>

        <div class="absolute bottom-12 flex space-x-6">
          <button
            (click)="toggleCamera()"
            class="w-20 h-20 bg-red-500 text-black rounded-full shadow-[0_0_40px_rgba(220,38,38,0.5)] hover:scale-110 active:scale-90 transition-all flex items-center justify-center"
          >
            <lucide-icon [name]="Camera" size="32" class="stroke-[3]"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Floating Result Sheet -->
      <div
        *ngIf="lastResult"
        class="absolute bottom-0 left-0 right-0 p-10 bg-slate-800/90 backdrop-blur-3xl text-white rounded-t-[4rem] border-t border-red-500/30 shadow-[0_-40px_80px_rgba(0,0,0,0.5)] animate-slide-up z-30"
      >
        <div class="w-16 h-1.5 bg-slate-800 rounded-full mx-auto mb-8 shadow-inner"></div>
        <div class="flex items-start space-x-8">
          <div
            class="w-32 h-32 bg-slate-800 rounded-3xl overflow-hidden flex-shrink-0 border border-red-500/30 shadow-2xl"
          >
            <img [src]="lastResult.image" class="w-full h-full object-cover transform scale-110" />
          </div>
          <div class="space-y-2 flex-1">
            <div class="flex items-center gap-2">
               <span class="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black tracking-widest uppercase border border-red-500/20 rounded-lg">Identificado</span>
               <span class="text-slate-500 font-mono text-xs">{{ lastResult.sku }}</span>
            </div>
            <h2 class="text-3xl font-black leading-tight tracking-tight mt-1">
              {{ lastResult.name }}
            </h2>
            <div class="flex items-center gap-6 mt-4">
              <span class="text-4xl font-black text-red-500"
                >$ {{ lastResult.price }}</span
              >
              <div class="flex flex-col">
                 <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Disponibilidad</span>
                 <span class="text-emerald-400 font-black">{{ lastResult.stock }} UNIDADES</span>
              </div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 mt-10">
          <button class="bg-red-500 hover:bg-red-400 text-black font-black py-5 rounded-2xl transition-all shadow-lg shadow-red-500/20 transform hover:-translate-y-1">
            Vincular a Venta
          </button>
          <button
            class="px-6 py-5 bg-white/5 border border-red-500/30 text-white font-black rounded-2xl hover:bg-white/10 transition-all"
          >
            Ficha Técnica
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes scan {
        0% {
          transform: translateY(0);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          transform: translateY(400px);
          opacity: 0;
        }
      }
      .animate-scan {
        animation: scan 3s linear infinite;
      }
      .animate-slide-up {
        animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes slide-up {
        from {
          transform: translateY(100%);
        }
        to {
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class AdminScannerComponent implements OnInit {
  @ViewChild("videoElement") videoElement!: ElementRef;
  api = inject(ApiService);
  lastResult: any = null;
  cameraActive = false;

  Camera = Camera;
  Scan = Scan;
  X = X;

  ngOnInit() {
    // Mocking a scan result for visualization
    setTimeout(() => {
      this.lastResult = {
        name: "Taladro Percutor Bosch GSB 13 RE",
        sku: "BSCH-452109",
        price: "89.500",
        stock: 14,
        image:
          "https://images.unsplash.com/photo-1504148455328-c996973521f5?q=80&w=200",
      };
    }, 4000);
  }

  async toggleCamera() {
    this.cameraActive = !this.cameraActive;
    if (this.cameraActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        this.videoElement.nativeElement.srcObject = stream;
      } catch (err) {
        console.error("Error access camera", err);
      }
    } else {
      const stream = this.videoElement.nativeElement.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
    }
  }
}
