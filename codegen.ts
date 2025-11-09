import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:5067/graphql',
  documents: './graphql/**/*.graphql',
  generates: {
    './graphql/generated.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-apollo-angular'],
      config: {
        scalars: {
          UUID: 'string',
        },
        addExplicitOverride: true,
      },
    },
  },
};
export default config;
