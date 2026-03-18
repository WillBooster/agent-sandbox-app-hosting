import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [".next/**", "drizzle/mount/**", "test-results/**"],
  },
];

export default config;
