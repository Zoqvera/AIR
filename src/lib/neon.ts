import { createClient } from "@neondatabase/neon-js";
import { BetterAuthReactAdapter } from "@neondatabase/neon-js/auth/react/adapters";

const authUrl =
  process.env.NEXT_PUBLIC_NEON_AUTH_URL ??
  "https://ep-sparkling-glitter-av1h8cwi.neonauth.c-11.us-east-1.aws.neon.tech/neondb/auth";

const dataApiUrl =
  process.env.NEXT_PUBLIC_NEON_DATA_API_URL ??
  "https://ep-sparkling-glitter-av1h8cwi.apirest.c-11.us-east-1.aws.neon.tech/neondb/rest/v1";

export const neon = createClient({
  auth: {
    adapter: BetterAuthReactAdapter(),
    url: authUrl,
  },
  dataApi: {
    url: dataApiUrl,
  },
});
