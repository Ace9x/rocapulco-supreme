// babel-preset-expo inlines process.env.EXPO_PUBLIC_* at build time.
// Declare the shape here so strict TS doesn't complain in the Supabase client
// (this file is picked up by include: "**/*.ts" in tsconfig).
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SUPABASE_URL: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
  }
}
