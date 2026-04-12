// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// NOTE: In production, Claude API key should be added via Netlify environment variables
// or the app will use localStorage for API key provided via Settings page
export const environment = {
  production: true,
  supabase: {
    url: 'https://eejwbapeabedzvtknjad.supabase.co',
    key: 'sb_publishable_dZXEzlt_Ztwsa6hARg-Lzg_iyeGbbYi'
  },
  claude: {
    apiKey: '' // Leave empty; Netlify function will use a server-side secret.
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
