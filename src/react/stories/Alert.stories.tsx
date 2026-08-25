import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert';
import { Icon } from '../../components/ui/icon';

const meta: Meta<typeof Alert> = {
  title: 'shadcn/Alert',
  component: Alert,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>
        This is an alert message. It can contain important information.
      </AlertDescription>
    </Alert>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Alert>
      <Icon name="info" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        This alert contains an icon to draw attention.
      </AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert>
      <Icon name="check-circle" />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your operation completed successfully.
      </AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert>
      <Icon name="alert-triangle" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        Please review this warning before proceeding.
      </AlertDescription>
    </Alert>
  ),
};

export const Error: Story = {
  render: () => (
    <Alert>
      <Icon name="alert-circle" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        An error occurred. Please try again later.
      </AlertDescription>
    </Alert>
  ),
};

export const WithLongDescription: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Important Notice</AlertTitle>
      <AlertDescription>
        This is a longer alert description that spans multiple lines. It provides more context
        and detail about the alert message. Alerts are useful for communicating important
        information to users.
      </AlertDescription>
    </Alert>
  ),
};

export const Minimal: Story = {
  render: () => (
    <Alert>
      <AlertDescription>
        Simple alert without title
      </AlertDescription>
    </Alert>
  ),
};
