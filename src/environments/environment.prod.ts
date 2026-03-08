
export const environment = {
  production: true,
  // Injetado pelo CI via GitHub Actions secret GEMINI_API_KEY
  geminiApiKey: '__GEMINI_API_KEY__',
  // Injetado pelo CI via GitHub Actions secret MERCADO_PAGO_TOKEN
  mercadoPagoAccessToken: '__MERCADO_PAGO_TOKEN__',
  enableImmutabilityChecks: true
};
