# Vistas (ViewSets) que realizan operaciones CRUD sobre ventas y clientes
# Maneja creación de pedidos, actualización de estado de entrega y reportes de ventas
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.sales.models import Sale, Customer, Ticket, Budget, BudgetItem
from apps.sales.serializers import SaleSerializer, CustomerSerializer, TicketSerializer
from apps.sales.budget_serializers import BudgetSerializer
from apps.sales.services.external import AFIPService, WhatsAppService

class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all().order_by('-created_at')
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def convert_to_sale(self, request, pk=None):
        """ Converts this budget into a concrete Sale, reducing stock. """
        budget = self.get_object()
        if budget.status == 'ACCEPTED':
            return Response({"error": "Budget already accepted"}, status=400)
            
        # Create Sale
        from apps.sales.serializers import SaleSerializer
        sale_data = {
            'customer': budget.customer.id if budget.customer else None,
            'total': budget.total,
            'payment_status': 'PAID', # Default or pending
        }
        
        # Prepare items for SaleSerializer
        items = []
        for b_item in budget.items.all():
            items.append({
                'product': b_item.product.id,
                'quantity': b_item.quantity,
                'price_at_sale': b_item.price_at_budget
            })
            
        serializer = SaleSerializer(data=sale_data, context={'items': items})
        if serializer.is_valid():
            serializer.save()
            budget.status = 'ACCEPTED'
            budget.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all().order_by('-created_at')
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def generate_invoice(self, request, pk=None):
        """ Calls AFIP service to generate invoice for this sale """
        res = AFIPService.create_invoice(pk)
        return Response(res)

    @action(detail=True, methods=['post'])
    def send_shipping_email(self, request, pk=None):
        """ Sends shipping notification email to customer """
        sale = self.get_object()
        if not sale.customer or not sale.customer.email:
            return Response({"error": "No se encontró el email del cliente"}, status=400)
            
        # Build items list for email
        items_list = ""
        for item in sale.items.all():
            items_list += f"- {item.product.name} (x{item.quantity}) - ${item.subtotal}\n"
            
        subject = f"¡Tu pedido #{sale.id} está en camino! 🚚"
        message = (
            f"Hola {sale.customer.name},\n\n"
            f"¡Grandes noticias! Tu pedido #{sale.id} ya ha sido enviado y está en camino a tu dirección: {sale.shipping_address}.\n\n"
            f"Detalle de tu compra:\n"
            f"{items_list}\n"
            f"Total: ${sale.total}\n\n"
            f"¡Gracias por confiar en FerrePro!"
        )
        
        # Simulate sending or use Django send_mail
        # from django.core.mail import send_mail
        # send_mail(subject, message, 'noreply@ferrepro.com', [sale.customer.email])
        
        print(f"EMAIL SENT TO {sale.customer.email}:\nSubject: {subject}\nBody: {message}")
        
        return Response({"status": "success", "message": f"Email enviado a {sale.customer.email}"})

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]
