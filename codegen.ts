import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:5067/graphql',
  documents: './graphql/**/*.graphql',
  generates: {
    './graphql/generated.ts': {
      plugins: ['typescript-operations', 'typescript-apollo-angular'],
      config: {
        addExplicitOverride: true,
      },
    },
  },
  overwrite: true,
};
export default config;
