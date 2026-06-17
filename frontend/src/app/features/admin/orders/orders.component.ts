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
          <h2 class="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
            <lucide-icon [name]="ClipboardList" size="28" class="text-red-500"></lucide-icon>
            Órdenes de Venta
          </h2>
          <p class="text-slate-400 mt-1">Gestiona los pedidos de tu tienda online</p>
        </div>
        <button (click)="loadOrders()" class="flex items-center gap-2 px-4 py-2 bg-white/5 border border-red-500/30 rounded-xl text-slate-300 hover:bg-white/10 transition-all">
          <lucide-icon [name]="RefreshCw" size="16" [class.animate-spin]="loading"></lucide-icon>
          Actualizar
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-slate-800/60 border border-red-500/20 rounded-xl p-4 text-center">
          <p class="text-2xl font-black text-white">{{ orders.length }}</p>
          <p class="text-xs text-slate-400 font-bold uppercase">Total</p>
        </div>
        <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
          <p class="text-2xl font-black text-yellow-400">{{ getCountByPaymentStatus('PENDING') }}</p>
          <p class="text-xs text-yellow-400/70 font-bold uppercase">Pendientes</p>
        </div>
        <div class="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <p class="text-2xl font-black text-green-400">{{ getCountByPaymentStatus('PAID') }}</p>
          <p class="text-xs text-green-400/70 font-bold uppercase">Pagados</p>
        </div>
        <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
          <p class="text-2xl font-black text-blue-400">{{ getCountByShippingStatus('SHIPPED') }}</p>
          <p class="text-xs text-blue-400/70 font-bold uppercase">Enviados</p>
        </div>
        <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <p class="text-2xl font-black text-red-400">{{ getCountByPaymentStatus('REJECTED') }}</p>
          <p class="text-xs text-red-400/70 font-bold uppercase">Rechazados</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex gap-4 flex-wrap">
        <div class="flex items-center bg-slate-800/60 border border-red-500/30 rounded-xl px-4 py-2 gap-2 flex-1 max-w-sm">
          <lucide-icon [name]="Search" size="16" class="text-slate-500"></lucide-icon>
          <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="filterOrders()" placeholder="Buscar por cliente, ID o dirección..." class="bg-transparent text-white text-sm focus:outline-none flex-1">
        </div>
        <select [(ngModel)]="statusFilter" (ngModelChange)="filterOrders()" class="bg-slate-800/60 border border-red-500/30 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-red-500 cursor-pointer">
          <option value="">Pago: Todos</option>
          <option value="PENDING">Pendiente</option>
          <option value="PAID">Pagado</option>
          <option value="REJECTED">Rechazado</option>
        </select>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-12">
        <lucide-icon [name]="RefreshCw" size="32" class="text-red-500 animate-spin mx-auto"></lucide-icon>
        <p class="text-slate-400 mt-4">Cargando órdenes...</p>
      </div>

      <!-- Orders Table -->
      <div *ngIf="!loading" class="bg-slate-800/40 border border-red-500/20 rounded-2xl overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-red-500/30">
              <th class="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
              <th class="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
              <th class="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Total</th>
              <th class="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Pago</th>
              <th class="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Envío</th>
              <th class="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
              <th class="text-right px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of filteredOrders" class="border-b border-red-500/20 hover:bg-white/5 transition-colors">
              <td class="px-6 py-4 font-black text-red-500">#{{ order.id }}</td>
              <td class="px-6 py-4 text-white font-medium">{{ order.customer?.name || 'Consumidor Final' }}</td>
              <td class="px-6 py-4 text-white font-black">\${{ order.total }}</td>
              <td class="px-6 py-4">
                <p-dropdown 
                  [(ngModel)]="order.payment_status" 
                  [options]="paymentStatusOptions"
                  (onChange)="updateSale(order)"
                  styleClass="custom-status-dropdown"
                  [appendTo]="'body'"
                >
                  <ng-template pTemplate="selectedItem">
                    <div class="flex items-center gap-2 px-2 py-1 rounded-lg font-bold text-xs" [ngClass]="getPaymentStatusClasses(order.payment_status)">
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
                    <div class="flex items-center gap-2 px-2 py-1 rounded-lg font-bold text-xs" [ngClass]="getShippingStatusClasses(order.shipping_status)">
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
              <td class="px-6 py-4 text-slate-400 text-xs">{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="px-6 py-4 text-right space-x-2">
                <button (click)="viewOrder(order)" class="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors" title="Ver detalle">
                  <lucide-icon [name]="Eye" size="14"></lucide-icon>
                </button>
                <button *ngIf="order.payment_status === 'PAID' && order.shipping_status === 'SHIPPED'" 
                        (click)="sendShippingEmail(order)" 
                        class="px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-colors" 
                        title="Enviar notificación de envío">
                  <lucide-icon [name]="Mail" size="14"></lucide-icon>
                </button>
                <button (click)="deleteSale(order)" class="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors" title="Eliminar venta">
                  <lucide-icon [name]="Trash2" size="14"></lucide-icon>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="filteredOrders.length === 0" class="text-center py-12 text-slate-500">
          No se encontraron órdenes
        </div>
      </div>

      <!-- Order Detail Modal -->
      <div *ngIf="selectedOrder" class="fixed inset-0 bg-slate-800/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="selectedOrder = null">
        <div class="bg-slate-800 border border-red-500/30 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between p-6 border-b border-red-500/30">
            <h3 class="text-lg font-black text-white">Pedido #{{ selectedOrder.id }}</h3>
            <button (click)="selectedOrder = null" class="text-slate-400 hover:text-white transition-colors">
              <lucide-icon [name]="X" size="20"></lucide-icon>
            </button>
          </div>
          <div class="p-6 space-y-6">
            <!-- Customer Info -->
            <div class="bg-white/5 rounded-xl p-4 space-y-2">
              <h4 class="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Datos del Cliente</h4>
              <div class="flex items-center gap-2 text-sm">
                <lucide-icon [name]="User" size="14" class="text-slate-500"></lucide-icon>
                <span class="text-white">{{ selectedOrder.customer?.name || 'Consumidor Final' }}</span>
              </div>
            </div>
            
            <!-- Shipping -->
            <div class="bg-white/5 rounded-xl p-4">
              <h4 class="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Dirección de Envío</h4>
              <p class="text-sm text-slate-300 flex items-start gap-2">
                <lucide-icon [name]="MapPin" size="14" class="text-slate-500 mt-0.5"></lucide-icon>
                {{ selectedOrder.shipping_address || 'Sin dirección' }}
              </p>
            </div>

            <!-- Items -->
            <div class="bg-white/5 rounded-xl p-4">
              <h4 class="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Productos</h4>
              <div *ngFor="let item of selectedOrder.items" class="flex justify-between items-center py-2 border-b border-red-500/20 last:border-0">
                <div>
                  <span class="text-white font-medium text-sm">Producto #{{ item.product }}</span>
                  <span class="text-slate-500 text-xs ml-2">x{{ item.quantity }}</span>
                </div>
                <span class="text-white font-bold text-sm">\${{ item.subtotal }}</span>
              </div>
            </div>

            <!-- Total -->
            <div class="flex justify-between items-center bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <span class="text-red-500 font-bold">Total del Pedido</span>
              <span class="text-2xl font-black text-red-500">\${{ selectedOrder.total }}</span>
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
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400';
      case 'PAID': return 'bg-green-500/20 text-green-400';
      case 'REJECTED': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  }

  getShippingStatusClasses(status: string): string {
    switch(status) {
      case 'PENDING': return 'bg-slate-500/20 text-slate-400';
      case 'SHIPPED': return 'bg-blue-500/20 text-blue-400';
      case 'DELIVERED': return 'bg-emerald-500/20 text-emerald-400';
      default: return 'bg-slate-500/20 text-slate-400';
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
