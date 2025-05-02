module.exports = {
  client: {
    excludes: ['./graphql/generated.ts'],
    service: {
      name: 'gateway',
      url: 'http://localhost:5067/graphql',
    },
  },
};
