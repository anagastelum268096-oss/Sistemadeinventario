import { Edit2, Trash2, MapPin, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Instrument } from '@/app/types';
import { EditInstrumentDialog } from './EditInstrumentDialog';
import { useAuth } from '@/app/context/AuthContext';

interface InstrumentListProps {
  instruments: Instrument[];
  onUpdateInstrument: (id: string, instrument: Omit<Instrument, 'id'>) => void;
  onDeleteInstrument: (id: string) => void;
}

export function InstrumentList({ instruments, onUpdateInstrument, onDeleteInstrument }: InstrumentListProps) {
  const [editingInstrument, setEditingInstrument] = useState<Instrument | null>(null);
  const { isAdmin } = useAuth();

  const getConditionStyle = (condition: string) => {
    switch (condition) {
      case 'Excelente':
        return 'bg-green-100 text-green-800';
      case 'Bueno':
        return 'bg-blue-100 text-blue-800';
      case 'Regular':
        return 'bg-yellow-100 text-yellow-800';
      case 'Necesita reparación':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (instruments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Music className="size-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No se encontraron instrumentos
        </h3>
        <p className="text-gray-500">
          Intenta ajustar tus filtros de búsqueda o agrega un nuevo instrumento.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instrumento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condición
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notas
                </th>
                {isAdmin() && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {instruments.map((instrument) => {
                return (
                  <tr key={instrument.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-mono font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded inline-block">
                        {instrument.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{instrument.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                        {instrument.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{instrument.quantity}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <MapPin className="size-4 text-gray-400" />
                        {instrument.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getConditionStyle(instrument.condition)}`}>
                        {instrument.condition === 'Necesita reparación' && (
                          <AlertCircle className="size-3" />
                        )}
                        {instrument.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {instrument.notes || '-'}
                      </div>
                    </td>
                    {isAdmin() && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingInstrument(instrument)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Estás seguro de eliminar "${instrument.name}"?`)) {
                                onDeleteInstrument(instrument.id);
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isAdmin() && editingInstrument && (
        <EditInstrumentDialog
          open={!!editingInstrument}
          onOpenChange={(open) => !open && setEditingInstrument(null)}
          instrument={editingInstrument}
          onUpdateInstrument={(updated) => {
            onUpdateInstrument(editingInstrument.id, updated);
            setEditingInstrument(null);
          }}
        />
      )}
    </>
  );
}

function Music(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}