import { useState, useEffect } from 'react';
import { Loan, Instrument } from '@/app/types';
import { Download, Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { LoansList } from '@/app/components/loans/LoansList';
import { AddLoanDialog } from '@/app/components/loans/AddLoanDialog';
import { exportLoansToExcel } from '@/app/utils/exportToExcel';
import { importLoans } from '@/app/utils/importFromExcel';
import { ImportButton } from '@/app/components/ImportButton';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/supabase/config';

export function Loans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar préstamos
        const { data: loansData, error: loansError } = await supabase
          .from('loans')
          .select('*')
          .order('created_at', { ascending: false });

        if (loansError) throw loansError;

        // Convertir de snake_case a camelCase y fechas
        const loansMapped: Loan[] = (loansData || []).map((l: any) => ({
          id: l.id,
          instrumentId: l.instrument_id,
          instrumentName: l.instrument_name,
          borrowerName: l.borrower_name,
          borrowerEmail: l.borrower_email,
          borrowerPhone: l.borrower_phone,
          loanDate: new Date(l.loan_date),
          expectedReturnDate: new Date(l.expected_return_date),
          actualReturnDate: l.actual_return_date ? new Date(l.actual_return_date) : undefined,
          quantity: l.quantity,
          status: l.status,
          notes: l.notes,
        }));
        setLoans(loansMapped);

        // Cargar instrumentos
        const { data: instrumentsData, error: instrumentsError } = await supabase
          .from('instruments')
          .select('*')
          .order('created_at', { ascending: false });

        if (instrumentsError) throw instrumentsError;
        setInstruments(instrumentsData || []);

        // Verificar préstamos vencidos
        await updateLoanStatuses();
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar datos desde la base de datos');
      }
    };

    fetchData();

    // Suscribirse a cambios en tiempo real
    const loansChannel = supabase
      .channel('loans-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'loans' },
        () => { fetchData(); }
      )
      .subscribe();

    const instrumentsChannel = supabase
      .channel('instruments-changes-loans')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'instruments' },
        () => { fetchData(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(loansChannel);
      supabase.removeChannel(instrumentsChannel);
    };
  }, []);

  const updateLoanStatuses = async () => {
    try {
      const { data: activeLoans, error } = await supabase
        .from('loans')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      const now = new Date();
      const overdueLoans = (activeLoans || []).filter((loan: any) => {
        const expectedReturn = new Date(loan.expected_return_date);
        return now > expectedReturn;
      });

      // Actualizar préstamos vencidos
      for (const loan of overdueLoans) {
        await supabase
          .from('loans')
          .update({ status: 'overdue' })
          .eq('id', loan.id);
      }
    } catch (error) {
      console.error('Error al actualizar estado de préstamos:', error);
    }
  };

  const handleAddLoan = async (newLoan: Omit<Loan, 'id'>) => {
    try {
      // Convertir de camelCase a snake_case
      const { error } = await supabase
        .from('loans')
        .insert([{
          instrument_id: newLoan.instrumentId,
          instrument_name: newLoan.instrumentName,
          borrower_name: newLoan.borrowerName,
          borrower_email: newLoan.borrowerEmail,
          borrower_phone: newLoan.borrowerPhone,
          loan_date: newLoan.loanDate.toISOString(),
          expected_return_date: newLoan.expectedReturnDate.toISOString(),
          actual_return_date: newLoan.actualReturnDate?.toISOString(),
          quantity: newLoan.quantity,
          status: newLoan.status,
          notes: newLoan.notes,
        }]);

      if (error) throw error;
      toast.success('Préstamo registrado exitosamente');
    } catch (error) {
      console.error('Error al agregar préstamo:', error);
      toast.error('Error al registrar préstamo');
    }
  };

  const handleUpdateLoan = async (updatedLoan: Loan) => {
    try {
      // Convertir de camelCase a snake_case
      const { error } = await supabase
        .from('loans')
        .update({
          instrument_id: updatedLoan.instrumentId,
          instrument_name: updatedLoan.instrumentName,
          borrower_name: updatedLoan.borrowerName,
          borrower_email: updatedLoan.borrowerEmail,
          borrower_phone: updatedLoan.borrowerPhone,
          loan_date: updatedLoan.loanDate.toISOString(),
          expected_return_date: updatedLoan.expectedReturnDate.toISOString(),
          actual_return_date: updatedLoan.actualReturnDate?.toISOString(),
          quantity: updatedLoan.quantity,
          status: updatedLoan.status,
          notes: updatedLoan.notes,
        })
        .eq('id', updatedLoan.id);

      if (error) throw error;
      toast.success('Préstamo actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar préstamo:', error);
      toast.error('Error al actualizar préstamo');
    }
  };

  const handleDeleteLoan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Préstamo eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar préstamo:', error);
      toast.error('Error al eliminar préstamo');
    }
  };

  const handleImportLoans = async (file: File) => {
    try {
      const importedLoans = await importLoans(file);

      // Convertir a formato Supabase
      const loansToInsert = importedLoans.map((loan) => ({
        instrument_id: loan.instrumentId,
        instrument_name: loan.instrumentName,
        borrower_name: loan.borrowerName,
        borrower_email: loan.borrowerEmail,
        borrower_phone: loan.borrowerPhone,
        loan_date: loan.loanDate.toISOString(),
        expected_return_date: loan.expectedReturnDate.toISOString(),
        actual_return_date: loan.actualReturnDate?.toISOString(),
        quantity: loan.quantity,
        status: loan.status,
        notes: loan.notes,
      }));

      const { error } = await supabase
        .from('loans')
        .insert(loansToInsert);

      if (error) throw error;
      toast.success(`${importedLoans.length} préstamos importados correctamente`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al importar el archivo. Verifica el formato.';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleExport = () => {
    exportLoansToExcel(loans);
    toast.success('Datos exportados a Excel');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Préstamos de Instrumentos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los préstamos de instrumentos musicales
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={handleExport} variant="outline" className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          {isAdmin() && (
            <>
              <ImportButton
                onImport={handleImportLoans}
                label="Importar"
              />
              <Button onClick={() => setIsAddDialogOpen(true)} className="flex-1 sm:flex-none">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Préstamo
              </Button>
            </>
          )}
        </div>
      </div>

      <LoansList
        loans={loans}
        instruments={instruments}
        onUpdate={handleUpdateLoan}
        onDelete={handleDeleteLoan}
      />

      {isAdmin() && (
        <AddLoanDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAdd={handleAddLoan}
          instruments={instruments}
        />
      )}
    </div>
  );
}