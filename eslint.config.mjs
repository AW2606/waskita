import nextConfig from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      ".venv/**",
      "out/**",
      "build/**",
      "dist/**",
      "*.db",
    ],
  },
  ...nextConfig,
];

export default eslintConfig;
