import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface ImportButtonProps {
  onImport: (file: File) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function ImportButton({ 
  onImport, 
  label = 'Importar Excel', 
  disabled = false,
  className = ''
}: ImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      // Resetear el input para permitir seleccionar el mismo archivo nuevamente
      event.target.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <Button
        onClick={handleClick}
        disabled={disabled}
        variant="outline"
        className={`flex-1 sm:flex-none ${className}`}
      >
        <Upload className="w-4 h-4 mr-2" />
        {label}
      </Button>
    </>
  );
}
