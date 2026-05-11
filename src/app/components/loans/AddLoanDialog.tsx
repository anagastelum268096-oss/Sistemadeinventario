import { useState } from 'react';
import { Loan, Instrument } from '@/app/types';
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

interface AddLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (loan: Omit<Loan, 'id'>) => void;
  instruments: Instrument[];
}

export function AddLoanDialog({ open, onOpenChange, onAdd, instruments }: AddLoanDialogProps) {
  const [selectedInstrumentId, setSelectedInstrumentId] = useState('');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerEmail, setBorrowerEmail] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedInstrument = instruments.find((i) => i.id === selectedInstrumentId);
    if (!selectedInstrument) return;

    onAdd({
      instrumentId: selectedInstrumentId,
      instrumentName: selectedInstrument.name,
      borrowerName,
      borrowerEmail,
      borrowerPhone,
      loanDate: new Date(loanDate),
      expectedReturnDate: new Date(expectedReturnDate),
      quantity,
      status: 'active',
      notes: notes || undefined,
    });

    // Reset form
    setSelectedInstrumentId('');
    setBorrowerName('');
    setBorrowerEmail('');
    setBorrowerPhone('');
    setLoanDate(new Date().toISOString().split('T')[0]);
    setExpectedReturnDate('');
    setQuantity(1);
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Préstamo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="instrument">Instrumento *</Label>
              <Select value={selectedInstrumentId} onValueChange={setSelectedInstrumentId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un instrumento" />
                </SelectTrigger>
                <SelectContent>
                  {instruments
                    .filter((i) => i.quantity > 0)
                    .map((instrument) => (
                      <SelectItem key={instrument.id} value={instrument.id}>
                        {instrument.name} - {instrument.code} (Disponible: {instrument.quantity})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
            <Button type="submit">Registrar Préstamo</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
