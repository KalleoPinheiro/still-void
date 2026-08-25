import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, type IconName } from '../../components/ui/icon';

const meta: Meta<typeof Icon> = {
  title: 'shadcn/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Icon>;

const ALL_NAMES: IconName[] = [
  'x',
  'check',
  'chevron-down',
  'chevron-up',
  'chevron-right',
  'chevron-left',
  'info',
  'alert-triangle',
  'alert-circle',
  'check-circle',
  'copy',
  'sun',
  'moon',
  'search',
  'menu',
];

export const Default: Story = {
  args: {
    name: 'check',
    size: 'md',
  },
};

/** The curated set, one row per size — the sizes are `.sv-icon` tokens, never a pixel prop. */
export const AllIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size}>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.8125rem', color: 'var(--sv-text-2)' }}>
            size=&quot;{size}&quot;
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--sv-text)' }}>
            {ALL_NAMES.map((name) => (
              <div
                key={name}
                title={name}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}
              >
                <Icon name={name} size={size} />
                <span style={{ fontSize: 'var(--sv-text-xs)', color: 'var(--sv-text-3)' }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

/** Without `label`, the icon is `aria-hidden` and decorative — the default. */
export const Decorative: Story = {
  args: {
    name: 'info',
  },
};

/** With `label`, the icon gets `role="img"` and an accessible name — use when the icon is the only content of a control. */
export const WithAccessibleLabel: Story = {
  args: {
    name: 'x',
    label: 'Close',
  },
};

/** currentColor: the icon always takes the color of its surrounding text. */
export const InheritsColor: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1.5rem' }}>
      <span style={{ color: 'var(--sv-accent-ink)' }}>
        <Icon name="check-circle" size="lg" />
      </span>
      <span style={{ color: 'var(--sv-danger)' }}>
        <Icon name="alert-triangle" size="lg" />
      </span>
      <span style={{ color: 'var(--sv-text-2)' }}>
        <Icon name="menu" size="lg" />
      </span>
    </div>
  ),
};
