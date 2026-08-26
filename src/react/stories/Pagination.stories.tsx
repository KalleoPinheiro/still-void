import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../components/ui/pagination';

const meta: Meta<typeof Pagination> = {
  title: 'shadcn/Pagination',
  component: Pagination,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#p1" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#p1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#p2" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#p3">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#p10">10</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#p3" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const ClientSideButtons: Story = {
  name: 'no href — buttons for client-side page state',
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => {}} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink onClick={() => {}} isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink onClick={() => {}}>2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext onClick={() => {}} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const Localized: Story = {
  name: 'Previous/Next labels overridden for pt-BR',
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#p1" label="Anterior" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#p1" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#p2">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#p2" label="Próxima" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};
