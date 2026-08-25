import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '../../components/ui/alert-dialog';
import { Button } from '../../components/ui/button';

const meta: Meta = {
  title: 'shadcn/AlertDialog',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj;

/**
 * Destructive confirmation (AD-007): a real dependency the package already
 * paid for, exported so a consumer stops reaching for `window.confirm` on an
 * irreversible action. `Action`/`Cancel` carry no default styling of their
 * own — compose them with `Button` via `asChild`, same as `DialogTrigger`.
 */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete account</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All data associated with this account will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive">Delete</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
};

/**
 * No close button (ALERT-04): unlike `Dialog`, there is no escape-hatch X —
 * dismissing always goes through an explicit choice.
 */
export const NoDescription: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Log out</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="ghost">Stay</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button>Log out</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
};
