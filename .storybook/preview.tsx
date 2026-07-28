import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import { accentNames, themeModes } from '../src/tokens/colors';
import '../src/css/theme.css';
import '../src/css/style.css';

const withTheme: Decorator = (Story, context) => {
  const { mode, accent } = context.globals;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.setAttribute('data-accent', accent);
  }, [mode, accent]);

  return (
    <div className="sv-body" style={{ padding: '2rem', minHeight: '100vh' }}>
      <Story />
    </div>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: { disable: true },
  },
  globalTypes: {
    mode: {
      description: 'Theme mode',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [...themeModes],
        dynamicTitle: true,
      },
    },
    accent: {
      description: 'Accent color',
      toolbar: {
        title: 'Accent',
        icon: 'paintbrush',
        items: [...accentNames],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    mode: 'dark',
    accent: 'cyan',
  },
  decorators: [withTheme],
};

export default preview;
