import { Music, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { Instrument } from '@/app/types';

interface InstrumentStatsCardsProps {
  instruments: Instrument[];
}

export function InstrumentStatsCards({ instruments }: InstrumentStatsCardsProps) {
  const totalInstruments = instruments.reduce((acc, inst) => acc + inst.quantity, 0);
  const uniqueLocations = new Set(instruments.map(i => i.location)).size;
  const needsRepair = instruments.filter(i => i.condition === 'Necesita reparación').length;
  const excellentCondition = instruments.filter(i => i.condition === 'Excelente').length;

  const stats = [
    {
      label: 'Total Instrumentos',
      value: totalInstruments,
      icon: Music,
      color: 'bg-blue-500',
    },
    {
      label: 'Ubicaciones',
      value: uniqueLocations,
      icon: MapPin,
      color: 'bg-green-500',
    },
    {
      label: 'Necesita Reparación',
      value: needsRepair,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      label: 'Estado Excelente',
      value: excellentCondition,
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white p-4 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 ${stat.color} rounded-lg`}>
                <Icon className="size-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
