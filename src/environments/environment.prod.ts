
export const environment = {
  production: true,
  // Injetado pelo CI via GitHub Secret GEMINI_API_KEY (veja .github/workflows/firebase-hosting.yml)
  geminiApiKey: '',
  // Injetado pelo CI via GitHub Secret MERCADO_PAGO_TOKEN (veja .github/workflows/firebase-hosting.yml)
  mercadoPagoAccessToken: '',
  enableImmutabilityChecks: true
};
