import { useState, useEffect } from 'react';
import { Category, GroupType } from '@/app/types';
import { Tag, Download, Users } from 'lucide-react';
import { Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { CategoriesList } from '@/app/components/categories/CategoriesList';
import { AddCategoryDialog } from '@/app/components/categories/AddCategoryDialog';
import { exportCategoriesToExcel } from '@/app/utils/exportToExcel';
import { importCategories } from '@/app/utils/importFromExcel';
import { ImportButton } from '@/app/components/ImportButton';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'instruments' | 'groups'>('instruments');
  const { isAdmin } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem('categories');
    if (saved) {
      setCategories(JSON.parse(saved));
    } else {
      // Sin categorías iniciales
      const defaultCategories: Category[] = [];
      setCategories(defaultCategories);
      localStorage.setItem('categories', JSON.stringify(defaultCategories));
    }

    const savedGroupTypes = localStorage.getItem('groupTypes');
    if (savedGroupTypes) {
      setGroupTypes(JSON.parse(savedGroupTypes));
    } else {
      // Sin tipos de grupo iniciales
      const defaultGroupTypes: GroupType[] = [];
      setGroupTypes(defaultGroupTypes);
      localStorage.setItem('groupTypes', JSON.stringify(defaultGroupTypes));
    }
  }, []);

  const handleAddCategory = (newCategory: Omit<Category, 'id'>) => {
    const category: Category = {
      ...newCategory,
      id: Date.now().toString(),
    };
    const updated = [...categories, category];
    setCategories(updated);
    localStorage.setItem('categories', JSON.stringify(updated));
    toast.success('Categoría agregada exitosamente');
  };

  const handleAddGroupType = (newGroupType: Omit<GroupType, 'id'>) => {
    const groupType: GroupType = {
      ...newGroupType,
      id: Date.now().toString(),
    };
    const updated = [...groupTypes, groupType];
    setGroupTypes(updated);
    localStorage.setItem('groupTypes', JSON.stringify(updated));
    toast.success('Tipo de grupo agregado exitosamente');
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    const updated = categories.map((cat) =>
      cat.id === updatedCategory.id ? updatedCategory : cat
    );
    setCategories(updated);
    localStorage.setItem('categories', JSON.stringify(updated));
    toast.success('Categoría actualizada exitosamente');
  };

  const handleUpdateGroupType = (updatedGroupType: GroupType) => {
    const updated = groupTypes.map((gt) =>
      gt.id === updatedGroupType.id ? updatedGroupType : gt
    );
    setGroupTypes(updated);
    localStorage.setItem('groupTypes', JSON.stringify(updated));
    toast.success('Tipo de grupo actualizado exitosamente');
  };

  const handleDeleteCategory = (id: string) => {
    const updated = categories.filter((cat) => cat.id !== id);
    setCategories(updated);
    localStorage.setItem('categories', JSON.stringify(updated));
  };

  const handleDeleteGroupType = (id: string) => {
    const updated = groupTypes.filter((gt) => gt.id !== id);
    setGroupTypes(updated);
    localStorage.setItem('groupTypes', JSON.stringify(updated));
  };

  const handleImportCategories = async (file: File) => {
    try {
      const importedCategories = await importCategories(file);
      const updated = [...categories, ...importedCategories];
      setCategories(updated);
      localStorage.setItem('categories', JSON.stringify(updated));
      toast.success(`${importedCategories.length} categorías importadas correctamente`);
    } catch (error) {
      toast.error('Error al importar el archivo. Verifica el formato.');
      console.error(error);
    }
  };

  const handleImportGroupTypes = async (file: File) => {
    try {
      const importedTypes = await importCategories(file); // Usa la misma función
      const updated = [...groupTypes, ...importedTypes];
      setGroupTypes(updated);
      localStorage.setItem('groupTypes', JSON.stringify(updated));
      toast.success(`${importedTypes.length} tipos de grupo importados correctamente`);
    } catch (error) {
      toast.error('Error al importar el archivo. Verifica el formato.');
      console.error(error);
    }
  };

  const handleExport = () => {
    if (activeTab === 'instruments') {
      exportCategoriesToExcel(categories);
    } else {
      exportCategoriesToExcel(groupTypes);
    }
    toast.success('Datos exportados a Excel');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Categorías y Tipos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las categorías de instrumentos y tipos de grupos
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
                onImport={activeTab === 'instruments' ? handleImportCategories : handleImportGroupTypes}
                label="Importar"
              />
              <Button onClick={() => setIsAddDialogOpen(true)} className="flex-1 sm:flex-none">
                <Plus className="w-4 h-4 mr-2" />
                {activeTab === 'instruments' ? 'Nueva Categoría' : 'Nuevo Tipo'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('instruments')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'instruments'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <Tag className="size-4" />
            Categorías de Instrumentos ({categories.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'groups'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <Users className="size-4" />
            Tipos de Grupos ({groupTypes.length})
          </span>
        </button>
      </div>

      {/* Categorías de Instrumentos */}
      {activeTab === 'instruments' && (
        <CategoriesList
          categories={categories}
          onUpdate={handleUpdateCategory}
          onDelete={handleDeleteCategory}
        />
      )}

      {/* Tipos de Grupos */}
      {activeTab === 'groups' && (
        <CategoriesList
          categories={groupTypes}
          onUpdate={handleUpdateGroupType}
          onDelete={handleDeleteGroupType}
        />
      )}

      {isAdmin() && (
        <AddCategoryDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAdd={activeTab === 'instruments' ? handleAddCategory : handleAddGroupType}
          title={activeTab === 'instruments' ? 'Nueva Categoría de Instrumento' : 'Nuevo Tipo de Grupo'}
          description={activeTab === 'instruments' ? 'Agrega una nueva categoría para instrumentos' : 'Agrega un nuevo tipo para grupos artísticos'}
          placeholder={activeTab === 'instruments' ? 'Ej: Cuerdas, Viento, Percusión' : 'Ej: Coro, Ensamble, Orquesta, Banda'}
        />
      )}
    </div>
  );
}