import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '../../components/ui/table';

const meta: Meta<typeof Table> = {
  title: 'shadcn/Table',
  component: Table,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Table>;

const patients = [
  { name: 'Ana Souza', room: '204', diagnosis: 'Real', total: 'R$ 420,00' },
  { name: 'Bruno Lima', room: '112', diagnosis: 'Risco', total: 'R$ 180,00' },
  { name: 'Carla Nunes', room: '301', diagnosis: 'Promoção da saúde', total: 'R$ 260,00' },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>Pacientes internados no turno atual</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Quarto</TableHead>
          <TableHead>Diagnóstico</TableHead>
          <TableHead>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.name}>
            <TableCell>{patient.name}</TableCell>
            <TableCell>{patient.room}</TableCell>
            <TableCell>{patient.diagnosis}</TableCell>
            <TableCell>{patient.total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell>R$ 860,00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const WideTableScrolls: Story = {
  name: 'Wide table scrolls inside its own container',
  render: () => (
    <div style={{ maxWidth: '480px' }}>
      <Table>
        <TableCaption>Excede a largura do container — rola só a tabela, não a página</TableCaption>
        <TableHeader>
          <TableRow>
            {['Nome', 'Quarto', 'Diagnóstico', 'Admissão', 'Alta prevista', 'Total', 'Responsável'].map(
              (col) => (
                <TableHead key={col}>{col}</TableHead>
              )
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Ana Souza</TableCell>
            <TableCell>204</TableCell>
            <TableCell>Real</TableCell>
            <TableCell>2026-08-18</TableCell>
            <TableCell>2026-08-25</TableCell>
            <TableCell>R$ 420,00</TableCell>
            <TableCell>Dra. Melo</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};
