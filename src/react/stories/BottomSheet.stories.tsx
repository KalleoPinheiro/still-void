import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetBody,
  BottomSheetFooter,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetClose,
} from '../../components/ui/bottom-sheet';
import { Button } from '../../components/ui/button';

const meta: Meta = {
  title: 'shadcn/BottomSheet',
  tags: ['autodocs'],
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <BottomSheet>
      <BottomSheetTrigger asChild>
        <Button>Abrir ficha</Button>
      </BottomSheetTrigger>
      <BottomSheetContent closeLabel="Cancelar">
        <BottomSheetHeader>
          <BottomSheetTitle>Editar paciente</BottomSheetTitle>
          <BottomSheetDescription>Arraste a alça para baixo, toque em Cancelar ou pressione Esc.</BottomSheetDescription>
        </BottomSheetHeader>
        <BottomSheetBody>
          {Array.from({ length: 12 }, (_, i) => (
            <p key={i}>Campo {i + 1}</p>
          ))}
        </BottomSheetBody>
        <BottomSheetFooter>
          <BottomSheetClose asChild>
            <Button variant="accent">Salvar</Button>
          </BottomSheetClose>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  ),
};
