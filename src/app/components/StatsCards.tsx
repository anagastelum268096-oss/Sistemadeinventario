import { Package, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import { Product } from '@/app/App';

interface StatsCardsProps {
  products: Product[];
}

export function StatsCards({ products }: StatsCardsProps) {
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.quantity <= p.minStock).length;
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  const categories = new Set(products.map(p => p.category)).size;

  const stats = [
    {
      label: 'Total Productos',
      value: totalProducts,
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Stock Bajo',
      value: lowStockProducts,
      icon: AlertTriangle,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Valor Total',
      value: `$${totalValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Categorías',
      value: categories,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="size-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
