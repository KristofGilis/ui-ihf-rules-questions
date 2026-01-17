export const environment = {
  production: true,
  apiUrl: 'https://api-ihf-rules-questions.azurewebsites.net/graphql',
  githubUrl: 'https://github.com/KristofGilis/ihf_rules_questions',
  sentry: {
    dsn: 'https://9ac8cd1cf1f48c9493e900d88770272d@o4510328824659968.ingest.de.sentry.io/4510328827281488', // Add your Sentry DSN here from https://sentry.io
    enabled: true, // Enabled in production
    environment: 'production',
    tracesSampleRate: 0.2, // 20% in production for better performance insights
  },
};
