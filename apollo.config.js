module.exports = {
  client: {
    excludes: ['./graphql/generated.ts'],
    service: {
      name: 'gateway',
      url: 'https://api-ihf-rules-questions.azurewebsites.net/graphql',
    },
  },
};
