// Variables de entorno para desarrollo: URL de API, modo debug, etc.
// Configuración especifica para ambiente local
export const environment = {
  production: false,
  apiUrl: "https://ferreteria-production-fc73.up.railway.app/api",
};

// Agregar número de WhatsApp y mensaje por defecto para el botón flotante
export const whatsappConfig = {
  number: "5491123456789", // formato internacional sin signos
  defaultMessage: "Hola, tengo una consulta sobre un producto.",
};
