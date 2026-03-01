import { useState, useEffect } from 'react';
import { Category } from '@/app/types';
import { Tag, Download } from 'lucide-react';
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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

  const handleUpdateCategory = (updatedCategory: Category) => {
    const updated = categories.map((cat) =>
      cat.id === updatedCategory.id ? updatedCategory : cat
    );
    setCategories(updated);
    localStorage.setItem('categories', JSON.stringify(updated));
    toast.success('Categoría actualizada exitosamente');
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id));
  };

  const handleImportCategories = async (file: File) => {
    try {
      const importedCategories = await importCategories(file);
      setCategories([...categories, ...importedCategories]);
      toast.success(`${importedCategories.length} categorías importadas correctamente`);
    } catch (error) {
      toast.error('Error al importar el archivo. Verifica el formato.');
      console.error(error);
    }
  };

  const handleExport = () => {
    exportCategoriesToExcel(categories);
    toast.success('Datos exportados a Excel');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Categorías de Instrumentos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las categorías del inventario
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
                onImport={handleImportCategories}
                label="Importar"
              />
              <Button onClick={() => setIsAddDialogOpen(true)} className="flex-1 sm:flex-none">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Categoría
              </Button>
            </>
          )}
        </div>
      </div>

      <CategoriesList
        categories={categories}
        onUpdate={handleUpdateCategory}
        onDelete={handleDeleteCategory}
      />

      {isAdmin() && (
        <AddCategoryDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAdd={handleAddCategory}
        />
      )}
    </div>
  );
}