from django.db import models

class IntegrationConfig(models.Model):
    """ Stores API keys and tokens for different integrations per tenant """
    INTEGRATION_CHOICES = (
        ('MELI', 'Mercado Libre'),
        ('CORREO_ARG', 'Correo Argentino'),
    )
    
    integration_type = models.CharField(max_length=20, choices=INTEGRATION_CHOICES)
    
    # Common fields
    client_id = models.CharField(max_length=255, null=True, blank=True)
    client_secret = models.CharField(max_length=255, null=True, blank=True)
    
    # Auth tokens
    access_token = models.TextField(null=True, blank=True)
    refresh_token = models.TextField(null=True, blank=True)
    token_expires_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    is_active = models.BooleanField(default=True)
    last_sync = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('integration_type',) # One config per type per tenant

    def __str__(self):
        return f"{self.integration_type} Config"
