import { useState, useEffect } from 'react';
import { Loan } from '@/app/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

interface EditLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: Loan;
  onUpdate: (loan: Loan) => void;
}

export function EditLoanDialog({ open, onOpenChange, loan, onUpdate }: EditLoanDialogProps) {
  const [borrowerName, setBorrowerName] = useState(loan.borrowerName);
  const [borrowerEmail, setBorrowerEmail] = useState(loan.borrowerEmail);
  const [borrowerPhone, setBorrowerPhone] = useState(loan.borrowerPhone);
  const [loanDate, setLoanDate] = useState(loan.loanDate.toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState(
    loan.expectedReturnDate.toISOString().split('T')[0]
  );
  const [actualReturnDate, setActualReturnDate] = useState(
    loan.actualReturnDate?.toISOString().split('T')[0] || ''
  );
  const [quantity, setQuantity] = useState(loan.quantity);
  const [status, setStatus] = useState(loan.status);
  const [notes, setNotes] = useState(loan.notes || '');

  useEffect(() => {
    setBorrowerName(loan.borrowerName);
    setBorrowerEmail(loan.borrowerEmail);
    setBorrowerPhone(loan.borrowerPhone);
    setLoanDate(loan.loanDate.toISOString().split('T')[0]);
    setExpectedReturnDate(loan.expectedReturnDate.toISOString().split('T')[0]);
    setActualReturnDate(loan.actualReturnDate?.toISOString().split('T')[0] || '');
    setQuantity(loan.quantity);
    setStatus(loan.status);
    setNotes(loan.notes || '');
  }, [loan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onUpdate({
      ...loan,
      borrowerName,
      borrowerEmail,
      borrowerPhone,
      loanDate: new Date(loanDate),
      expectedReturnDate: new Date(expectedReturnDate),
      actualReturnDate: actualReturnDate ? new Date(actualReturnDate) : undefined,
      quantity,
      status,
      notes: notes || undefined,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Préstamo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Instrumento</Label>
              <Input value={loan.instrumentName} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="borrowerName">Nombre del Solicitante *</Label>
              <Input
                id="borrowerName"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="borrowerEmail">Email *</Label>
              <Input
                id="borrowerEmail"
                type="email"
                value={borrowerEmail}
                onChange={(e) => setBorrowerEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="borrowerPhone">Teléfono *</Label>
              <Input
                id="borrowerPhone"
                value={borrowerPhone}
                onChange={(e) => setBorrowerPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loanDate">Fecha de Préstamo *</Label>
              <Input
                id="loanDate"
                type="date"
                value={loanDate}
                onChange={(e) => setLoanDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedReturnDate">Fecha de Retorno Esperada *</Label>
              <Input
                id="expectedReturnDate"
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualReturnDate">Fecha de Retorno Real</Label>
              <Input
                id="actualReturnDate"
                type="date"
                value={actualReturnDate}
                onChange={(e) => setActualReturnDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="returned">Devuelto</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Condiciones especiales, observaciones, etc."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
