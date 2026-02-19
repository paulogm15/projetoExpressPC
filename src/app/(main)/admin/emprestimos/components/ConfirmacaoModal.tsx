"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo: string;
  descricao?: string;
};

export default function ConfirmacaoModal({
  open,
  onClose,
  onConfirm,
  titulo,
  descricao,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>

        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          {descricao && (
            <DialogDescription>
              {descricao}
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>

          <Button onClick={onConfirm}>
            Confirmar
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
