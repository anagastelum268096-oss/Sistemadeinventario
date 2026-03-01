import { useState, useMemo, useEffect } from 'react';
import { Instrument } from '@/app/types';
import { InventoryHeader } from '@/app/components/inventory/InventoryHeader';
import { InstrumentList } from '@/app/components/inventory/InstrumentList';

// Datos iniciales vacíos
const initialInstruments: Instrument[] = [];

export function Inventory() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Cargar datos de localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('instruments');
    if (saved) {
      setInstruments(JSON.parse(saved));
    } else {
      setInstruments(initialInstruments);
      localStorage.setItem('instruments', JSON.stringify(initialInstruments));
    }
  }, []);

  // Guardar en localStorage cuando cambien los instrumentos
  useEffect(() => {
    if (instruments.length > 0) {
      localStorage.setItem('instruments', JSON.stringify(instruments));
    }
  }, [instruments]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(instruments.map((i) => i.category)));
    return ['all', ...cats];
  }, [instruments]);

  const filteredInstruments = useMemo(() => {
    return instruments.filter((instrument) => {
      const matchesSearch =
        instrument.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instrument.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instrument.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || instrument.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [instruments, searchTerm, categoryFilter]);

  const handleAddInstrument = (instrument: Omit<Instrument, 'id'>) => {
    const newInstrument = {
      ...instrument,
      id: Date.now().toString(),
    };
    setInstruments([...instruments, newInstrument]);
  };

  const handleImportInstruments = (importedInstruments: Instrument[]) => {
    setInstruments([...instruments, ...importedInstruments]);
  };

  const handleUpdateInstrument = (id: string, updated: Omit<Instrument, 'id'>) => {
    setInstruments(
      instruments.map((instrument) =>
        instrument.id === id ? { ...updated, id } : instrument
      )
    );
  };

  const handleDeleteInstrument = (id: string) => {
    setInstruments(instruments.filter((instrument) => instrument.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <InventoryHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
        onAddInstrument={handleAddInstrument}
        onImportInstruments={handleImportInstruments}
        instruments={instruments}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InstrumentList
          instruments={filteredInstruments}
          onUpdateInstrument={handleUpdateInstrument}
          onDeleteInstrument={handleDeleteInstrument}
        />
      </main>
    </div>
  );
}