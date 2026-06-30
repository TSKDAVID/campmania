/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  interface Env {
    DIDIT_API_KEY?: string;
    DIDIT_WEBHOOK_SECRET?: string;
    SHOPIFY_ADMIN_API_ACCESS_TOKEN?: string;
    SHOPIFY_CLIENT_ID?: string;
    SHOPIFY_CLIENT_SECRET?: string;
    CHECKOUT_EXTENSION_SECRET?: string;
    PUBLIC_STOREFRONT_ORIGIN?: string;
  }
}

