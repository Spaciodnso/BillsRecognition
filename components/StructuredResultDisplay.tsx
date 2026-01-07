
import React, { useState, useCallback } from 'react';
import { ClipboardIcon, CheckIcon } from './Icons';

interface StructuredResultDisplayProps {
  data: any;
  imageUrl: string;
}

const Field: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-gray-700 first:border-t-0">
      <dt className="text-sm font-medium text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-200 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">{value || 'N/A'}</dd>
    </div>
);

export const StructuredResultDisplay: React.FC<StructuredResultDisplayProps> = ({ data, imageUrl }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (navigator.clipboard && data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [data]);

  const { piezasRepuestas, ...mainData } = data;

  const fieldLabels: Record<string, string> = {
    cliente: "Cliente",
    albaran: "Albarán Nº",
    fecha: "Fecha",
    direccion: "Dirección",
    maquinaModelo: "Máquina/Modelo",
    nSerie: "Nº Serie",
    aviso: "Aviso",
    motivoAviso: "Motivo del aviso",
    reparacionEfectuada: "Reparación efectuada",
    observaciones: "Observaciones",
    lugarReparacion: "Lugar de Reparación",
    km: "KM",
    tiempoDesplazamiento: "Tiempo Desplazamiento",
    horarioManana: "Horario Mañana",
    tecnico: "Técnico",
    vehiculo: "Vehículo"
  };

  return (
    <div className="w-full max-w-7xl mt-8 animate-fade-in grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Image Column */}
      <div className="lg:col-span-2 flex flex-col items-center">
        <h2 className="text-xl font-semibold text-gray-200 mb-4 w-full">Imagen Original</h2>
        <div className="bg-gray-800 p-2 rounded-lg shadow-lg">
            <img src={imageUrl} alt="Original document" className="max-w-full h-auto rounded-md" />
        </div>
      </div>

      {/* Data Column */}
      <div className="lg:col-span-3 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-200">Datos Extraídos</h2>
            <button
                onClick={handleCopy}
                className="flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                aria-label="Copy JSON"
            >
                {copied ? <CheckIcon className="w-5 h-5 text-green-400 mr-2" /> : <ClipboardIcon className="w-5 h-5 text-gray-400 mr-2" />}
                {copied ? 'Copiado!' : 'Copiar JSON'}
            </button>
        </div>
        
        <dl>
            {Object.entries(fieldLabels).map(([key, label]) => (
                mainData[key] && <Field key={key} label={label} value={mainData[key]} />
            ))}
        </dl>

        {piezasRepuestas && piezasRepuestas.length > 0 && (
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-2 pt-4 border-t border-gray-700">Piezas Repuestas</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-600">
                        <thead className="bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Código</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Denominación</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cantidad</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-600">
                            {piezasRepuestas.map((pieza: any, index: number) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{pieza.codigo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{pieza.denominacion}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{pieza.cantidad}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
