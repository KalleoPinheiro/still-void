import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';

const meta: Meta<typeof Alert> = {
  title: 'shadcn/Alert',
  component: Alert,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Alert>;

export const Neutral: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>
        This is an alert message without a variant. It remains neutral and displays the original behavior.
      </AlertDescription>
    </Alert>
  ),
};

export const Info: Story = {
  render: () => (
    <Alert variant="info">
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        This is an info alert with derived role and default icon.
      </AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert variant="success">
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your operation completed successfully.
      </AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert variant="warning">
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        Please review this warning before proceeding.
      </AlertDescription>
    </Alert>
  ),
};

export const Danger: Story = {
  render: () => (
    <Alert variant="danger">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        An error occurred. Please try again later.
      </AlertDescription>
    </Alert>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Alert variant="info">
      <AlertTitle>Update Available</AlertTitle>
      <AlertDescription>
        A new version is available. Review and install the latest features.
      </AlertDescription>
      <div className="sv-alert__action">
        <Button size="sm" variant="ghost">
          Install now
        </Button>
      </div>
    </Alert>
  ),
};

export const NoIcon: Story = {
  render: () => (
    <Alert variant="success" icon={null}>
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        This alert has no icon, even though a variant with a default icon is applied.
      </AlertDescription>
    </Alert>
  ),
};
