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

export function Loans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const savedLoans = localStorage.getItem('loans');
    if (savedLoans) {
      const parsed = JSON.parse(savedLoans);
      setLoans(
        parsed.map((loan: any) => ({
          ...loan,
          loanDate: new Date(loan.loanDate),
          expectedReturnDate: new Date(loan.expectedReturnDate),
          actualReturnDate: loan.actualReturnDate ? new Date(loan.actualReturnDate) : undefined,
        }))
      );
    }

    const savedInstruments = localStorage.getItem('instruments');
    if (savedInstruments) {
      setInstruments(JSON.parse(savedInstruments));
    }

    // Verificar préstamos vencidos
    updateLoanStatuses();
  }, []);

  const updateLoanStatuses = () => {
    const savedLoans = localStorage.getItem('loans');
    if (!savedLoans) return;

    const parsed = JSON.parse(savedLoans);
    const now = new Date();
    let updated = false;

    const updatedLoans = parsed.map((loan: any) => {
      if (loan.status === 'active') {
        const expectedReturn = new Date(loan.expectedReturnDate);
        if (now > expectedReturn) {
          updated = true;
          return { ...loan, status: 'overdue' };
        }
      }
      return loan;
    });

    if (updated) {
      localStorage.setItem('loans', JSON.stringify(updatedLoans));
      setLoans(
        updatedLoans.map((loan: any) => ({
          ...loan,
          loanDate: new Date(loan.loanDate),
          expectedReturnDate: new Date(loan.expectedReturnDate),
          actualReturnDate: loan.actualReturnDate ? new Date(loan.actualReturnDate) : undefined,
        }))
      );
    }
  };

  const handleAddLoan = (newLoan: Omit<Loan, 'id'>) => {
    const loan: Loan = {
      ...newLoan,
      id: Date.now().toString(),
    };
    const updatedLoans = [...loans, loan];
    setLoans(updatedLoans);
    localStorage.setItem('loans', JSON.stringify(updatedLoans));
    toast.success('Préstamo registrado exitosamente');
  };

  const handleUpdateLoan = (updatedLoan: Loan) => {
    const updatedLoans = loans.map((loan) =>
      loan.id === updatedLoan.id ? updatedLoan : loan
    );
    setLoans(updatedLoans);
    localStorage.setItem('loans', JSON.stringify(updatedLoans));
    toast.success('Préstamo actualizado exitosamente');
  };

  const handleDeleteLoan = (id: string) => {
    setLoans(loans.filter((loan) => loan.id !== id));
  };

  const handleImportLoans = async (file: File) => {
    try {
      const importedLoans = await importLoans(file);
      setLoans([...loans, ...importedLoans]);
      toast.success(`${importedLoans.length} préstamos importados correctamente`);
    } catch (error) {
      toast.error('Error al importar el archivo. Verifica el formato.');
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