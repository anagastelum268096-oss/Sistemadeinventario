import { Search, Plus, Music, Download } from 'lucide-react';
import { useState } from 'react';
import { AddInstrumentDialog } from './AddInstrumentDialog';
import { Instrument } from '@/app/types';
import { InstrumentStatsCards } from './InstrumentStatsCards';
import { exportInstrumentsToExcel } from '@/app/utils/exportToExcel';
import { importInstruments } from '@/app/utils/importFromExcel';
import { ImportButton } from '@/app/components/ImportButton';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

interface InventoryHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  onAddInstrument: (instrument: Omit<Instrument, 'id'>) => void;
  onImportInstruments: (instruments: Instrument[]) => void;
  instruments: Instrument[];
}

export function InventoryHeader({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories,
  onAddInstrument,
  onImportInstruments,
  instruments,
}: InventoryHeaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isAdmin } = useAuth();

  const handleExport = () => {
    exportInstrumentsToExcel(instruments);
  };

  const handleImport = async (file: File) => {
    try {
      const importedInstruments = await importInstruments(file);
      onImportInstruments(importedInstruments);
      toast.success(`${importedInstruments.length} instrumentos importados correctamente`);
    } catch (error) {
      toast.error('Error al importar el archivo. Verifica el formato.');
      console.error(error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Music className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Inventario de Instrumentos
                </h1>
                <p className="text-sm text-gray-500">Gestión de instrumentos y ubicaciones</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-1 sm:flex-initial justify-center"
              >
                <Download className="size-5" />
                <span className="hidden sm:inline">Exportar Excel</span>
                <span className="sm:hidden">Exportar</span>
              </button>
              {isAdmin() && (
                <>
                  <ImportButton
                    onImport={handleImport}
                    label="Importar"
                    className="hidden sm:flex"
                  />
                  <button
                    onClick={() => setDialogOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex-1 sm:flex-initial justify-center"
                  >
                    <Plus className="size-5" />
                    <span className="hidden sm:inline">Agregar Instrumento</span>
                    <span className="sm:hidden">Agregar</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <InstrumentStatsCards instruments={instruments} />

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o ubicación..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todas las categorías</option>
              {categories.filter(c => c !== 'all').map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isAdmin() && (
        <AddInstrumentDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onAddInstrument={onAddInstrument}
        />
      )}
    </header>
  );
}