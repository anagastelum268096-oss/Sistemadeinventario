import { useState, useMemo, useEffect } from 'react';
import { Instrument } from '@/app/types';
import { InventoryHeader } from '@/app/components/inventory/InventoryHeader';
import { InstrumentList } from '@/app/components/inventory/InstrumentList';
import { db } from '@/firebase/config';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext'; 

export function Inventory() {
  const { user } = useAuth();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Cargar datos de Firestore en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'inventario'),
      (snapshot) => {
        const instrumentsData: Instrument[] = [];
        snapshot.forEach((doc) => {
          instrumentsData.push({
            id: doc.id,
            ...doc.data()
          } as Instrument);
        });
        setInstruments(instrumentsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error al cargar instrumentos:', error);
        toast.error('Error al cargar el inventario', {
          description: 'No se pudieron cargar los instrumentos desde la base de datos'
        });
        setLoading(false);
      }
    );

    // Cleanup
    return () => unsubscribe();
  }, []);

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

  const handleAddInstrument = async (instrument: Omit<Instrument, 'id'>) => {
    try {
      await addDoc(collection(db, 'inventario'), instrument);
      toast.success('Instrumento agregado exitosamente');
    } catch (error) {
      console.error('Error al agregar instrumento:', error);
      toast.error('Error al agregar instrumento', {
        description: 'No se pudo guardar el instrumento en la base de datos'
      });
    }
  };

  const handleImportInstruments = async (importedInstruments: Instrument[]) => {
    try {
      const promises = importedInstruments.map(({ id, ...instrument }) =>
        addDoc(collection(db, 'inventario'), instrument)
      );
      await Promise.all(promises);
      toast.success(`${importedInstruments.length} instrumentos importados exitosamente`);
    } catch (error) {
      console.error('Error al importar instrumentos:', error);
      toast.error('Error al importar instrumentos', {
        description: 'No se pudieron importar todos los instrumentos'
      });
    }
  };

  const handleUpdateInstrument = async (id: string, updated: Omit<Instrument, 'id'>) => {
    try {
      const instrumentRef = doc(db, 'inventario', id);
      await updateDoc(instrumentRef, updated as any);
      toast.success('Instrumento actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar instrumento:', error);
      toast.error('Error al actualizar instrumento', {
        description: 'No se pudieron guardar los cambios'
      });
    }
  };

  const handleDeleteInstrument = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inventario', id));
      toast.success('Instrumento eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar instrumento:', error);
      toast.error('Error al eliminar instrumento', {
        description: 'No se pudo eliminar el instrumento de la base de datos'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando inventario...</p>
        </div>
      </div>
    );
  }

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