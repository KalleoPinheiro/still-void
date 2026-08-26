import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import {
  ChartAxis,
  ChartBar,
  ChartContainer,
  ChartGrid,
  ChartLine,
} from '../src/components/ui/chart';

afterEach(cleanup);

describe('ChartContainer (R4-06 AC1)', () => {
  test('renders an svg with role="img", the right viewBox and sv-chart', () => {
    const { container } = render(<ChartContainer width={400} height={200} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 400 200');
    expect(svg?.getAttribute('class')).toContain('sv-chart');
  });

  test('aria-label is optional and passes through as the accessible name', () => {
    const { container } = render(<ChartContainer width={400} height={200} aria-label="Healing score over time" />);
    expect(container.querySelector('svg')?.getAttribute('aria-label')).toBe(
      'Healing score over time',
    );
  });

  test('renders children inside the svg', () => {
    const { container } = render(
      <ChartContainer width={100} height={50}>
        <circle data-testid="dot" cx={1} cy={1} r={1} />
      </ChartContainer>,
    );
    expect(container.querySelector('[data-testid="dot"]')).not.toBeNull();
  });
});

describe('ChartGrid (R4-06 AC2)', () => {
  test('horizontal: one <line> per position, spanning 0..width, stroked and classed', () => {
    const { container } = render(
      <svg>
        <ChartGrid orientation="horizontal" positions={[0, 50, 100]} width={400} />
      </svg>,
    );
    const lines = [...container.querySelectorAll('line')];
    expect(lines).toHaveLength(3);
    expect(lines.map((l) => l.getAttribute('y1'))).toEqual(['0', '50', '100']);
    for (const line of lines) {
      expect(line.getAttribute('x1')).toBe('0');
      expect(line.getAttribute('x2')).toBe('400');
      expect(line.getAttribute('class')).toContain('sv-chart__grid-line');
    }
  });

  test('vertical: one <line> per position, spanning 0..width on the y axis', () => {
    const { container } = render(
      <svg>
        <ChartGrid orientation="vertical" positions={[10, 20]} width={200} />
      </svg>,
    );
    const lines = [...container.querySelectorAll('line')];
    expect(lines).toHaveLength(2);
    expect(lines.map((l) => l.getAttribute('x1'))).toEqual(['10', '20']);
    for (const line of lines) {
      expect(line.getAttribute('y1')).toBe('0');
      expect(line.getAttribute('y2')).toBe('200');
    }
  });

  test('empty positions renders no lines, no error', () => {
    const { container } = render(
      <svg>
        <ChartGrid orientation="horizontal" positions={[]} width={400} />
      </svg>,
    );
    expect(container.querySelectorAll('line')).toHaveLength(0);
  });
});

describe('ChartAxis (R4-06 AC3)', () => {
  test('bottom: a baseline line plus one <text> per tick', () => {
    const { container } = render(
      <svg>
        <ChartAxis
          orientation="bottom"
          ticks={[
            { position: 0, label: '0' },
            { position: 100, label: '10' },
          ]}
          length={400}
        />
      </svg>,
    );
    const line = container.querySelector('line.sv-chart__axis');
    expect(line?.getAttribute('x1')).toBe('0');
    expect(line?.getAttribute('x2')).toBe('400');
    const texts = [...container.querySelectorAll('text.sv-chart__axis-label')];
    expect(texts.map((t) => t.textContent)).toEqual(['0', '10']);
  });

  test('left: a vertical baseline plus ticks anchored to the end', () => {
    const { container } = render(
      <svg>
        <ChartAxis orientation="left" ticks={[{ position: 50, label: '5' }]} length={200} />
      </svg>,
    );
    const line = container.querySelector('line.sv-chart__axis');
    expect(line?.getAttribute('y1')).toBe('0');
    expect(line?.getAttribute('y2')).toBe('200');
    const text = container.querySelector('text.sv-chart__axis-label');
    expect(text?.textContent).toBe('5');
    expect(text?.getAttribute('text-anchor')).toBe('end');
  });
});

describe('ChartLine (R4-06 AC4)', () => {
  test('renders a polyline with the right points, fill=none, stroke=color', () => {
    const { container } = render(
      <svg>
        <ChartLine
          points={[
            { x: 0, y: 10 },
            { x: 50, y: 5 },
            { x: 100, y: 20 },
          ]}
          color="var(--sv-accent-ink)"
        />
      </svg>,
    );
    const polyline = container.querySelector('polyline');
    expect(polyline?.getAttribute('points')).toBe('0,10 50,5 100,20');
    expect(polyline?.getAttribute('fill')).toBe('none');
    expect(polyline?.getAttribute('stroke')).toBe('var(--sv-accent-ink)');
    expect(polyline?.getAttribute('class')).toContain('sv-chart__line');
  });

  test('empty points renders a polyline with no points, no error', () => {
    const { container } = render(
      <svg>
        <ChartLine points={[]} color="var(--sv-accent-ink)" />
      </svg>,
    );
    expect(container.querySelector('polyline')?.getAttribute('points')).toBe('');
  });
});

describe('ChartBar (R4-06 AC5)', () => {
  test('renders one <rect> per bar with the right geometry and fill', () => {
    const { container } = render(
      <svg>
        <ChartBar bars={[{ x: 0, y: 10, width: 20, height: 30 }]} color="var(--sv-info-ink)" />
      </svg>,
    );
    const rect = container.querySelector('rect');
    expect(rect?.getAttribute('x')).toBe('0');
    expect(rect?.getAttribute('y')).toBe('10');
    expect(rect?.getAttribute('width')).toBe('20');
    expect(rect?.getAttribute('height')).toBe('30');
    expect(rect?.getAttribute('fill')).toBe('var(--sv-info-ink)');
    expect(rect?.getAttribute('class')).toContain('sv-chart__bar');
  });

  test('empty bars renders no rects, no error', () => {
    const { container } = render(
      <svg>
        <ChartBar bars={[]} color="var(--sv-info-ink)" />
      </svg>,
    );
    expect(container.querySelectorAll('rect')).toHaveLength(0);
  });
});

describe('Chart — component identity', () => {
  test.each([
    ['ChartContainer', ChartContainer],
    ['ChartGrid', ChartGrid],
    ['ChartAxis', ChartAxis],
    ['ChartLine', ChartLine],
    ['ChartBar', ChartBar],
  ])('%s has a literal displayName', (name, Component) => {
    expect(Component.displayName).toBe(name);
  });
});
