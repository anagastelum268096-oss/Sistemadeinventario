import { useState } from 'react';
import { Loan, Instrument } from '@/app/types';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { Edit2, Trash2, Music, User, Calendar, AlertCircle } from 'lucide-react';
import { EditLoanDialog } from './EditLoanDialog';

interface LoansListProps {
  loans: Loan[];
  instruments: Instrument[];
  onUpdate: (loan: Loan) => void;
  onDelete: (id: string) => void;
}

export function LoansList({ loans, instruments, onUpdate, onDelete }: LoansListProps) {
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [deletingLoan, setDeletingLoan] = useState<Loan | null>(null);
  const { isAdmin } = useAuth();

  const getStatusBadge = (status: Loan['status']) => {
    const variants = {
      active: 'default',
      returned: 'secondary',
      overdue: 'destructive',
    } as const;

    const labels = {
      active: 'Activo',
      returned: 'Devuelto',
      overdue: 'Vencido',
    };

    return (
      <Badge variant={variants[status]}>
        {status === 'overdue' && <AlertCircle className="w-3 h-3 mr-1" />}
        {labels[status]}
      </Badge>
    );
  };

  const getDaysUntilReturn = (loan: Loan) => {
    if (loan.status === 'returned') return null;
    
    const today = new Date();
    const returnDate = loan.expectedReturnDate;
    const diffTime = returnDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  if (loans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Music className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No hay préstamos registrados</p>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin() ? 'Comienza registrando el primer préstamo' : 'Aún no hay préstamos en el sistema'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Vista Desktop */}
      <div className="hidden md:block">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instrumento</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Fecha Préstamo</TableHead>
                <TableHead>Retorno Esperado</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Estado</TableHead>
                {isAdmin() && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => {
                const daysUntilReturn = getDaysUntilReturn(loan);
                return (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.instrumentName}</TableCell>
                    <TableCell>{loan.borrowerName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{loan.borrowerEmail}</div>
                        <div className="text-muted-foreground">{loan.borrowerPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{loan.loanDate.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span>{loan.expectedReturnDate.toLocaleDateString()}</span>
                        {daysUntilReturn !== null && (
                          <span className={`text-xs ${daysUntilReturn < 0 ? 'text-destructive' : daysUntilReturn <= 3 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                            {daysUntilReturn < 0 
                              ? `Vencido hace ${Math.abs(daysUntilReturn)} días`
                              : daysUntilReturn === 0
                              ? 'Vence hoy'
                              : `${daysUntilReturn} días restantes`
                            }
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{loan.quantity}</TableCell>
                    <TableCell>{getStatusBadge(loan.status)}</TableCell>
                    {isAdmin() && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingLoan(loan)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingLoan(loan)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Vista Mobile */}
      <div className="md:hidden space-y-4">
        {loans.map((loan) => {
          const daysUntilReturn = getDaysUntilReturn(loan);
          return (
            <Card key={loan.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{loan.instrumentName}</p>
                      <p className="text-sm text-muted-foreground">Cantidad: {loan.quantity}</p>
                    </div>
                  </div>
                  {getStatusBadge(loan.status)}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{loan.borrowerName}</p>
                    <p className="text-muted-foreground">{loan.borrowerEmail}</p>
                    <p className="text-muted-foreground">{loan.borrowerPhone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Préstamo:</span>
                      <span>{loan.loanDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Retorno:</span>
                      <span>{loan.expectedReturnDate.toLocaleDateString()}</span>
                    </div>
                    {daysUntilReturn !== null && (
                      <p className={`mt-1 ${daysUntilReturn < 0 ? 'text-destructive' : daysUntilReturn <= 3 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                        {daysUntilReturn < 0 
                          ? `Vencido hace ${Math.abs(daysUntilReturn)} días`
                          : daysUntilReturn === 0
                          ? 'Vence hoy'
                          : `${daysUntilReturn} días restantes`
                        }
                      </p>
                    )}
                  </div>
                </div>

                {loan.notes && (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                    {loan.notes}
                  </div>
                )}

                {isAdmin() && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditingLoan(loan)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setDeletingLoan(loan)}
                    >
                      <Trash2 className="w-4 h-4 mr-2 text-destructive" />
                      Eliminar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      {editingLoan && (
        <EditLoanDialog
          open={!!editingLoan}
          onOpenChange={() => setEditingLoan(null)}
          loan={editingLoan}
          onUpdate={onUpdate}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingLoan} onOpenChange={() => setDeletingLoan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar préstamo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el registro del préstamo de{' '}
              <strong>{deletingLoan?.instrumentName}</strong> a{' '}
              <strong>{deletingLoan?.borrowerName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingLoan) {
                  onDelete(deletingLoan.id);
                  setDeletingLoan(null);
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
