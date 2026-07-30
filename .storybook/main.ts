import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/react-vite',
  // The published Storybook lives at a GitHub Pages *project* path
  // (/still-void/), not at the domain root — relative asset URLs keep it
  // working there without hardcoding the repository name.
  viteFinal: (config, { configType }) => {
    if (configType === 'PRODUCTION') {
      config.base = './';
    }
    return config;
  },
};

export default config;
