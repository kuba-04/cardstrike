/// <reference types="astro/client" />

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database, "public">;
      user?: User;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly OPENROUTER_HTTP_REFERER?: string;
  readonly OPENROUTER_DEFAULT_SYSTEM_MESSAGE?: string;
  readonly OPENROUTER_MODEL_NAME?: string;
  readonly OPENROUTER_API_URL?: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface User {
  id: string;
  email: string | null;
}
