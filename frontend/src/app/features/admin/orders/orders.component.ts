import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { DropdownModule } from 'primeng/dropdown';
import {
  LucideAngularModule,
  ClipboardList,
  Eye,
  ChevronDown,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  X,
  MapPin,
  User,
  Mail,
  Phone,
  CreditCard,
  Trash2
} from 'lucide-angular';

interface SaleItem {
  id: number;
  product: number;
  quantity: number;
  price_at_sale: string;
  subtotal: string;
}

interface Sale {
  id: number;
  customer: any;
  total: string;
  payment_method: string;
  payment_status: string;
  shipping_status: string;
  shipping_address: string;
  tracking_number: string;
  mp_preference_id: string;
  mp_payment_id: string;
  created_at: string;
  items: SaleItem[];
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DropdownModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-extrabold text-white uppercase tracking-wider flex items-center gap-3" style="font-family: Sora, sans-serif;">
            <lucide-icon [name]="ClipboardList" size="28" class="text-ferre-600"></lucide-icon>
            Ordenes de Venta
          </h2>
          <p class="text-steel-400 mt-1">Gestiona los pedidos de tu tienda online</p>
        </div>
        <button (click)="loadOrders()" class="flex items-center gap-2 px-4 py-2 bg-[#1a1f27] border border-[#2a2f38] rounded-lg text-steel-400 hover:bg-[#1a1f27]/5 transition-all font-semibold text-sm">
          <lucide-icon [name]="RefreshCw" size="16" [class.animate-spin]="loading"></lucide-icon>
          Actualizar
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="card-industrial p-4 text-center">
          <p class="text-2xl font-extrabold text-white" style="font-family: Sora, sans-serif;">{{ orders.length }}</p>
          <p class="text-[10px] text-steel-400 font-bold uppercase tracking-wider">Total</p>
        </div>
        <div class="p-4 text-center" style="background: #FFC10710; border: 2px solid #FFC107; border-left: 4px solid #d45e08; border-radius: 0.375rem;">
          <p class="text-2xl font-extrabold text-amber-700" style="font-family: Sora, sans-serif;">{{ getCountByPaymentStatus('PENDING') }}</p>
          <p class="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Pendientes</p>
        </div>
        <div class="p-4 text-center" style="background: #22c55e10; border: 2px solid #22c55e30; border-left: 4px solid #22c55e; border-radius: 0.375rem;">
          <p class="text-2xl font-extrabold text-green-700" style="font-family: Sora, sans-serif;">{{ getCountByPaymentStatus('PAID') }}</p>
          <p class="text-[10px] text-green-700 font-bold uppercase tracking-wider">Pagados</p>
        </div>
        <div class="p-4 text-center" style="background: #3b82f610; border: 2px solid #3b82f630; border-left: 4px solid #3b82f6; border-radius: 0.375rem;">
          <p class="text-2xl font-extrabold text-blue-600" style="font-family: Sora, sans-serif;">{{ getCountByShippingStatus('SHIPPED') }}</p>
          <p class="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Enviados</p>
        </div>
        <div class="p-4 text-center" style="background: #ef444410; border: 2px solid #ef444430; border-left: 4px solid #ef4444; border-radius: 0.375rem;">
          <p class="text-2xl font-extrabold text-safety-red" style="font-family: Sora, sans-serif;">{{ getCountByPaymentStatus('REJECTED') }}</p>
          <p class="text-[10px] text-safety-red font-bold uppercase tracking-wider">Rechazados</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex gap-4 flex-wrap">
        <div class="flex items-center bg-[#1a1f27] border border-[#2a2f38] rounded-lg px-4 py-2 gap-2 flex-1 max-w-sm">
          <lucide-icon [name]="Search" size="16" class="text-steel-500"></lucide-icon>
          <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="filterOrders()" placeholder="Buscar por cliente, ID o direccion..." class="bg-transparent text-white text-sm focus:outline-none flex-1">
        </div>
        <select [(ngModel)]="statusFilter" (ngModelChange)="filterOrders()" class="bg-[#1a1f27] border border-[#2a2f38] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-ferre-600 cursor-pointer">
          <option value="">Pago: Todos</option>
          <option value="PENDING">Pendiente</option>
          <option value="PAID">Pagado</option>
          <option value="REJECTED">Rechazado</option>
        </select>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-12">
        <lucide-icon [name]="RefreshCw" size="32" class="text-ferre-600 animate-spin mx-auto"></lucide-icon>
        <p class="text-steel-400 mt-4">Cargando ordenes...</p>
      </div>

      <!-- Orders Table -->
      <div *ngIf="!loading" class="card-industrial overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr style="background: #1a1f27;">
              <th class="text-left px-6 py-3 text-[10px] font-bold text-steel-400 uppercase tracking-wider" style="border-bottom: 2px solid #2a2f38;">ID</th>
              <th class="text-left px-6 py-3 text-[10px] font-bold text-steel-400 uppercase tracking-wider" style="border-bottom: 2px solid #2a2f38;">Cliente</th>
              <th class="text-left px-6 py-3 text-[10px] font-bold text-steel-400 uppercase tracking-wider" style="border-bottom: 2px solid #2a2f38;">Total</th>
              <th class="text-left px-6 py-3 text-[10px] font-bold text-steel-400 uppercase tracking-wider" style="border-bottom: 2px solid #2a2f38;">Pago</th>
              <th class="text-left px-6 py-3 text-[10px] font-bold text-steel-400 uppercase tracking-wider" style="border-bottom: 2px solid #2a2f38;">Envio</th>
              <th class="text-left px-6 py-3 text-[10px] font-bold text-steel-400 uppercase tracking-wider" style="border-bottom: 2px solid #2a2f38;">Fecha</th>
              <th class="text-right px-6 py-3 text-[10px] font-bold text-steel-400 uppercase tracking-wider" style="border-bottom: 2px solid #2a2f38;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of filteredOrders" class="border-b border-[#2a2f38] hover:bg-[#1a1f27]/5 transition-colors">
              <td class="px-6 py-4 font-extrabold text-ferre-600">#{{ order.id }}</td>
              <td class="px-6 py-4 text-white font-semibold">{{ order.customer?.name || 'Consumidor Final' }}</td>
              <td class="px-6 py-4 text-white font-extrabold">\${{ order.total }}</td>
              <td class="px-6 py-4">
                <p-dropdown 
                  [(ngModel)]="order.payment_status" 
                  [options]="paymentStatusOptions"
                  (onChange)="updateSale(order)"
                  styleClass="custom-status-dropdown"
                  [appendTo]="'body'"
                >
                  <ng-template pTemplate="selectedItem">
                    <div class="flex items-center gap-2 px-2 py-1 rounded-lg font-bold text-xs border" [ngClass]="getPaymentStatusClasses(order.payment_status)">
                      {{ getPaymentStatusLabel(order.payment_status) }}
                    </div>
                  </ng-template>
                  <ng-template let-option pTemplate="item">
                    <div class="flex items-center gap-2 font-bold text-sm">
                      {{ option.label }}
                    </div>
                  </ng-template>
                </p-dropdown>
              </td>
              <td class="px-6 py-4">
                <p-dropdown 
                  [(ngModel)]="order.shipping_status" 
                  [options]="shippingStatusOptions"
                  (onChange)="updateSale(order)"
                  styleClass="custom-status-dropdown"
                  [appendTo]="'body'"
                >
                  <ng-template pTemplate="selectedItem">
                    <div class="flex items-center gap-2 px-2 py-1 rounded-lg font-bold text-xs border" [ngClass]="getShippingStatusClasses(order.shipping_status)">
                      {{ getShippingStatusLabel(order.shipping_status) }}
                    </div>
                  </ng-template>
                  <ng-template let-option pTemplate="item">
                    <div class="flex items-center gap-2 font-bold text-sm">
                      {{ option.label }}
                    </div>
                  </ng-template>
                </p-dropdown>
              </td>
              <td class="px-6 py-4 text-steel-400 text-xs">{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="px-6 py-4 text-right space-x-2">
                <button (click)="viewOrder(order)" class="px-3 py-1.5 bg-ferre-600/10 text-ferre-600 rounded-lg text-xs font-bold hover:bg-ferre-600/10 border border-ferre-600/20 transition-colors" title="Ver detalle">
                  <lucide-icon [name]="Eye" size="14"></lucide-icon>
                </button>
                <button *ngIf="order.payment_status === 'PAID' && order.shipping_status === 'SHIPPED'" 
                        (click)="sendShippingEmail(order)" 
                        class="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/10 border border-blue-500/20 transition-colors" 
                        title="Enviar notificación de envío">
                  <lucide-icon [name]="Mail" size="14"></lucide-icon>
                </button>
                <button (click)="deleteSale(order)" class="px-3 py-1.5 bg-safety-red/10 text-safety-red rounded-lg text-xs font-bold hover:bg-safety-red/10 border border-safety-red/20 transition-colors" title="Eliminar venta">
                  <lucide-icon [name]="Trash2" size="14"></lucide-icon>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="filteredOrders.length === 0" class="text-center py-12 text-steel-500">
          No se encontraron órdenes
        </div>
      </div>

      <!-- Order Detail Modal -->
      <div *ngIf="selectedOrder" class="fixed inset-0 bg-steel-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="selectedOrder = null">
        <div class="bg-[#1a1f27] border-2 border-[#2a2f38] rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto relative" (click)="$event.stopPropagation()">
          <!-- Tornillos -->
          <div class="absolute top-3 left-3 screw"></div>
          <div class="absolute top-3 right-3 screw"></div>
          <div class="flex items-center justify-between p-6" style="border-bottom: 2px solid #2a2f38;">
            <h3 class="text-lg font-extrabold text-white uppercase tracking-wider" style="font-family: Sora, sans-serif;">Pedido #{{ selectedOrder.id }}</h3>
            <button (click)="selectedOrder = null" class="text-steel-500 hover:text-white transition-colors">
              <lucide-icon [name]="X" size="20"></lucide-icon>
            </button>
          </div>
          <div class="p-6 space-y-6">
            <!-- Customer Info -->
            <div class="bg-[#13161c] rounded-lg p-4 space-y-2 border border-[#2a2f38]">
              <h4 class="text-[10px] font-bold text-ferre-600 uppercase tracking-wider mb-3">Datos del Cliente</h4>
              <div class="flex items-center gap-2 text-sm">
                <lucide-icon [name]="User" size="14" class="text-steel-500"></lucide-icon>
                <span class="text-white font-semibold">{{ selectedOrder.customer?.name || 'Consumidor Final' }}</span>
              </div>
            </div>
            
            <!-- Shipping -->
            <div class="bg-[#13161c] rounded-lg p-4 border border-[#2a2f38]">
              <h4 class="text-[10px] font-bold text-ferre-600 uppercase tracking-wider mb-3">Direccion de Envio</h4>
              <p class="text-sm text-steel-400 flex items-start gap-2">
                <lucide-icon [name]="MapPin" size="14" class="text-steel-500 mt-0.5"></lucide-icon>
                {{ selectedOrder.shipping_address || 'Sin direccion' }}
              </p>
            </div>

            <!-- Items -->
            <div class="bg-[#13161c] rounded-lg p-4 border border-[#2a2f38]">
              <h4 class="text-[10px] font-bold text-ferre-600 uppercase tracking-wider mb-3">Productos</h4>
              <div *ngFor="let item of selectedOrder.items" class="flex justify-between items-center py-2 border-b border-[#2a2f38] last:border-0">
                <div>
                  <span class="text-white font-semibold text-sm">Producto #{{ item.product }}</span>
                  <span class="text-steel-500 text-xs ml-2">x{{ item.quantity }}</span>
                </div>
                <span class="text-white font-bold text-sm">\${{ item.subtotal }}</span>
              </div>
            </div>

            <!-- Total -->
            <div class="flex justify-between items-center p-4" style="background: #d45e0810; border: 2px solid #d45e0830; border-left: 4px solid #d45e08; border-radius: 0.375rem;">
              <span class="text-ferre-600 font-bold">Total del Pedido</span>
              <span class="text-2xl font-extrabold text-ferre-600" style="font-family: Sora, sans-serif;">\${{ selectedOrder.total }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrdersComponent implements OnInit {
  private api = inject(ApiService);

  ClipboardList = ClipboardList;
  Eye = Eye;
  ChevronDown = ChevronDown;
  Search = Search;
  RefreshCw = RefreshCw;
  CheckCircle2 = CheckCircle2;
  Clock = Clock;
  Truck = Truck;
  Package = Package;
  XCircle = XCircle;
  X = X;
  MapPin = MapPin;
  User = User;
  Mail = Mail;
  Phone = Phone;
  CreditCard = CreditCard;
  Trash2 = Trash2;

  orders: Sale[] = [];
  filteredOrders: Sale[] = [];
  selectedOrder: Sale | null = null;
  loading = false;
  searchTerm = '';
  statusFilter = '';

  paymentStatusOptions = [
    { label: '⏳ Pendiente', value: 'PENDING' },
    { label: '✅ Pagado', value: 'PAID' },
    { label: '❌ Rechazado', value: 'REJECTED' }
  ];

  shippingStatusOptions = [
    { label: '📦 No enviado', value: 'PENDING' },
    { label: '🚚 Enviado', value: 'SHIPPED' }
  ];

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.api.get<Sale[]>('/sales/').subscribe({
      next: (data) => {
        this.orders = data;
        this.filterOrders();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.loading = false;
      }
    });
  }

  filterOrders() {
    let filtered = [...this.orders];
    
    if (this.statusFilter) {
      filtered = filtered.filter(o => o.payment_status === this.statusFilter);
    }
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.id.toString().includes(term) ||
        (o.customer?.name || '').toLowerCase().includes(term) ||
        (o.shipping_address || '').toLowerCase().includes(term)
      );
    }
    
    this.filteredOrders = filtered;
  }

  getCountByPaymentStatus(status: string): number {
    return this.orders.filter(o => o.payment_status === status).length;
  }

  getCountByShippingStatus(status: string): number {
    return this.orders.filter(o => o.shipping_status === status).length;
  }

  getPaymentStatusClasses(status: string): string {
    switch(status) {
      case 'PENDING': return 'bg-safety-yellow/10 text-safety-yellow border border-safety-yellow/20';
      case 'PAID': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'REJECTED': return 'bg-safety-red/10 text-safety-red border border-safety-red/20';
      default: return 'bg-concrete-100 text-steel-400 border border-[#2a2f38]';
    }
  }

  getShippingStatusClasses(status: string): string {
    switch(status) {
      case 'PENDING': return 'bg-concrete-100 text-steel-400 border border-[#2a2f38]';
      case 'SHIPPED': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'DELIVERED': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      default: return 'bg-concrete-100 text-steel-400 border border-[#2a2f38]';
    }
  }

  updateSale(order: Sale) {
    this.api.patch<any>('/sales/' + order.id + '/', { 
      payment_status: order.payment_status,
      shipping_status: order.shipping_status
    }).subscribe({
      next: () => {
        console.log('Order updated successfully');
      },
      error: (err) => {
        console.error('Error updating order:', err);
      }
    });
  }

  viewOrder(order: Sale) {
    this.selectedOrder = order;
  }

  deleteSale(order: Sale) {
    if (confirm(`¿Estás seguro de que deseas eliminar la venta #${order.id}?`)) {
      this.api.delete('/sales/' + order.id + '/').subscribe({
        next: () => {
          this.orders = this.orders.filter(o => o.id !== order.id);
          this.filterOrders();
        },
        error: (err) => {
          console.error('Error deleting sale:', err);
          alert('No se pudo eliminar la venta');
        }
      });
    }
  }

  sendShippingEmail(order: Sale) {
    this.api.post<any>(`/sales/${order.id}/send_shipping_email/`, {}).subscribe({
      next: (res) => {
        alert(res.message || 'Email enviado correctamente');
      },
      error: (err) => {
        console.error('Error sending email:', err);
        alert('Error al enviar el email: ' + (err.error?.error || 'Desconocido'));
      }
    });
  }

  getPaymentStatusLabel(status: string): string {
    return this.paymentStatusOptions.find(o => o.value === status)?.label || status;
  }

  getShippingStatusLabel(status: string): string {
    return this.shippingStatusOptions.find(o => o.value === status)?.label || status;
  }
}
