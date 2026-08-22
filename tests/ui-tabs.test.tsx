import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../src/components/ui/tabs';

afterEach(cleanup);

function renderTabs() {
  return render(
    <Tabs defaultValue="one">
      <TabsList>
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
      </TabsList>
      <TabsContent value="one">First panel</TabsContent>
      <TabsContent value="two">Second panel</TabsContent>
    </Tabs>,
  );
}

describe('Tabs', () => {
  test('renders the default tab active', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('data-state', 'active');
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('data-state', 'inactive');
    expect(screen.getByText('First panel')).toBeVisible();
  });

  test('clicking a trigger switches the active tab', () => {
    renderTabs();
    const trigger = screen.getByRole('tab', { name: 'Two' });
    fireEvent.pointerDown(trigger);
    fireEvent.mouseDown(trigger);
    fireEvent.click(trigger);
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('Second panel')).toBeVisible();
  });

  test('forwards refs on List, Trigger and Content', () => {
    const listRef = createRef<HTMLDivElement>();
    const triggerRef = createRef<HTMLButtonElement>();
    const contentRef = createRef<HTMLDivElement>();
    render(
      <Tabs defaultValue="one">
        <TabsList ref={listRef}>
          <TabsTrigger ref={triggerRef} value="one">
            One
          </TabsTrigger>
        </TabsList>
        <TabsContent ref={contentRef} value="one">
          Panel
        </TabsContent>
      </Tabs>,
    );
    expect(listRef.current).toBeInstanceOf(HTMLDivElement);
    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
  });
});
