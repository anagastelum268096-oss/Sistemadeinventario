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
import { supabase } from '@/supabase/config';

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'instruments' | 'groups'>('instruments');
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar categorías
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('created_at', { ascending: false });

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Cargar tipos de grupo (también en tabla categories, pero con un campo type diferente si es necesario)
        // Nota: Asumo que groupTypes también se guardan en la tabla 'categories'
        // Si necesitas una tabla separada, ajusta esto
        const { data: groupTypesData, error: groupTypesError } = await supabase
          .from('categories')
          .select('*')
          .order('created_at', { ascending: false });

        if (groupTypesError) throw groupTypesError;
        setGroupTypes(groupTypesData || []);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar datos desde la base de datos');
      }
    };

    fetchData();

    // Suscribirse a cambios en tiempo real
    const categoriesChannel = supabase
      .channel('categories-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => { fetchData(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(categoriesChannel);
    };
  }, []);

  const handleAddCategory = async (newCategory: Omit<Category, 'id'>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert([newCategory]);

      if (error) throw error;
      toast.success('Categoría agregada exitosamente');
    } catch (error) {
      console.error('Error al agregar categoría:', error);
      toast.error('Error al agregar categoría');
    }
  };

  const handleAddGroupType = async (newGroupType: Omit<GroupType, 'id'>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert([newGroupType]);

      if (error) throw error;
      toast.success('Tipo de grupo agregado exitosamente');
    } catch (error) {
      console.error('Error al agregar tipo de grupo:', error);
      toast.error('Error al agregar tipo de grupo');
    }
  };

  const handleUpdateCategory = async (updatedCategory: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: updatedCategory.name,
          description: updatedCategory.description,
        })
        .eq('id', updatedCategory.id);

      if (error) throw error;
      toast.success('Categoría actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      toast.error('Error al actualizar categoría');
    }
  };

  const handleUpdateGroupType = async (updatedGroupType: GroupType) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: updatedGroupType.name,
          description: updatedGroupType.description,
        })
        .eq('id', updatedGroupType.id);

      if (error) throw error;
      toast.success('Tipo de grupo actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar tipo de grupo:', error);
      toast.error('Error al actualizar tipo de grupo');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Categoría eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      toast.error('Error al eliminar categoría');
    }
  };

  const handleDeleteGroupType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Tipo de grupo eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar tipo de grupo:', error);
      toast.error('Error al eliminar tipo de grupo');
    }
  };

  const handleImportCategories = async (file: File) => {
    try {
      const importedCategories = await importCategories(file);

      // Convertir a formato Supabase (remover id)
      const categoriesToInsert = importedCategories.map(({ id, ...category }) => category);

      const { error } = await supabase
        .from('categories')
        .insert(categoriesToInsert);

      if (error) throw error;
      toast.success(`${importedCategories.length} categorías importadas correctamente`);
    } catch (error) {
      toast.error('Error al importar el archivo. Verifica el formato.');
      console.error(error);
    }
  };

  const handleImportGroupTypes = async (file: File) => {
    try {
      const importedTypes = await importCategories(file); // Usa la misma función

      // Convertir a formato Supabase (remover id)
      const typesToInsert = importedTypes.map(({ id, ...type }) => type);

      const { error } = await supabase
        .from('categories')
        .insert(typesToInsert);

      if (error) throw error;
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