import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChartAxis, ChartBar, ChartContainer, ChartGrid, ChartLine } from '../../components/ui/chart';

const meta: Meta<typeof ChartContainer> = {
  title: 'shadcn/Chart',
  component: ChartContainer,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ChartContainer>;

const width = 360;
const height = 160;

export const LineWithGridAndAxis: Story = {
  name: 'ChartLine + ChartGrid + ChartAxis — a clinical score over time',
  render: () => (
    <ChartContainer width={width} height={height} aria-label="Score PUSH ao longo do tempo">
      <ChartGrid orientation="horizontal" positions={[20, 60, 100]} width={width} />
      <ChartLine
        points={[
          { x: 0, y: 100 },
          { x: 90, y: 70 },
          { x: 180, y: 60 },
          { x: 270, y: 30 },
          { x: 360, y: 10 },
        ]}
        color="var(--sv-accent-ink)"
      />
      {/* ChartAxis renders its own local y=0 as the baseline — the consumer
          positions it via a <g transform>, same as any other SVG primitive
          composed inside ChartContainer. Un-transformed, "bottom" would sit
          at the SVG's top edge instead of the plot's actual bottom. */}
      <g transform={`translate(0, 100)`}>
        <ChartAxis
          orientation="bottom"
          length={width}
          ticks={[
            { position: 0, label: 'Sem 1' },
            { position: 180, label: 'Sem 3' },
            { position: 360, label: 'Sem 5' },
          ]}
        />
      </g>
    </ChartContainer>
  ),
};

export const MultiSeries: Story = {
  name: 'Two series — the three system series tokens',
  render: () => (
    <ChartContainer width={width} height={height} aria-label="PUSH vs DET">
      <ChartGrid orientation="horizontal" positions={[20, 60, 100]} width={width} />
      <ChartLine
        points={[
          { x: 0, y: 100 },
          { x: 120, y: 70 },
          { x: 240, y: 50 },
          { x: 360, y: 20 },
        ]}
        color="var(--sv-accent-ink)"
      />
      <ChartLine
        points={[
          { x: 0, y: 90 },
          { x: 120, y: 80 },
          { x: 240, y: 40 },
          { x: 360, y: 15 },
        ]}
        color="var(--sv-warning-ink)"
      />
    </ChartContainer>
  ),
};

export const Bars: Story = {
  name: 'ChartBar — discrete measurements',
  render: () => (
    <ChartContainer width={width} height={height} aria-label="Medições por semana">
      <ChartGrid orientation="horizontal" positions={[20, 60, 100]} width={width} />
      <ChartBar
        bars={[
          { x: 10, y: 60, width: 40, height: 40 },
          { x: 80, y: 40, width: 40, height: 60 },
          { x: 150, y: 20, width: 40, height: 80 },
          { x: 220, y: 50, width: 40, height: 50 },
          { x: 290, y: 10, width: 40, height: 90 },
        ]}
        color="var(--sv-info-ink)"
      />
    </ChartContainer>
  ),
};
