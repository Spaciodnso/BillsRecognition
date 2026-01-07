
import React, { useState, useCallback } from 'react';
import { ClipboardIcon, CheckIcon } from './Icons.js';

const Field = ({ label, value }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyField = useCallback(() => {
        if (navigator.clipboard && value) {
            navigator.clipboard.writeText(value).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    }, [value]);

    return (
        React.createElement("div", { className: "py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-gray-700 first:border-t-0" },
            React.createElement("dt", { className: "text-sm font-medium text-gray-400" }, label),
            React.createElement("dd", { className: "mt-1 text-sm text-gray-200 sm:mt-0 sm:col-span-2 flex items-center justify-between whitespace-pre-wrap" },
                React.createElement("span", { className: "flex-grow" }, value || 'N/A'),
                value && (
                    React.createElement("button", {
                        onClick: handleCopyField,
                        className: "ml-2 p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500",
                        "aria-label": `Copiar ${label}`
                    },
                        copied ? React.createElement(CheckIcon, { className: "w-4 h-4 text-green-400" }) : React.createElement(ClipboardIcon, { className: "w-4 h-4" })
                    )
                )
            )
        )
    );
};

export const StructuredResultDisplay = ({ data, imageUrl }) => {
  const [copiedJson, setCopiedJson] = useState(false); // Renamed to avoid conflict with Field's internal state

  const handleCopyJson = useCallback(() => {
    if (navigator.clipboard && data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
      });
    }
  }, [data]);

  const { piezasRepuestas, ...mainData } = data;

  const fieldLabels = {
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
    React.createElement("div", { className: "w-full max-w-7xl mt-8 animate-fade-in grid grid-cols-1 lg:grid-cols-5 gap-8" },
      React.createElement("div", { className: "lg:col-span-2 flex flex-col items-center" },
        React.createElement("h2", { className: "text-xl font-semibold text-gray-200 mb-4 w-full" }, "Imagen Original"),
        React.createElement("div", { className: "bg-gray-800 p-2 rounded-lg shadow-lg" },
          React.createElement("img", { src: imageUrl, alt: "Original document", className: "max-w-full h-auto rounded-md" })
        )
      ),

      React.createElement("div", { className: "lg:col-span-3 bg-gray-800/50 border border-gray-700 rounded-xl p-6" },
        React.createElement("div", { className: "flex justify-between items-center mb-4" },
          React.createElement("h2", { className: "text-xl font-semibold text-gray-200" }, "Datos Extraídos"),
          React.createElement("button", {
            onClick: handleCopyJson,
            className: "flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500",
            "aria-label": "Copiar JSON"
          },
            copiedJson ? React.createElement(CheckIcon, { className: "w-5 h-5 text-green-400 mr-2" }) : React.createElement(ClipboardIcon, { className: "w-5 h-5 text-gray-400 mr-2" }),
            copiedJson ? 'Copiado!' : 'Copiar JSON'
          )
        ),
        
        React.createElement("dl", null,
          Object.entries(fieldLabels).map(([key, label]) => (
            mainData[key] && React.createElement(Field, { key: key, label: label, value: mainData[key] })
          ))
        ),

        piezasRepuestas && piezasRepuestas.length > 0 && (
          React.createElement("div", { className: "mt-6" },
            React.createElement("h3", { className: "text-lg font-semibold text-gray-200 mb-2 pt-4 border-t border-gray-700" }, "Piezas Repuestas"),
            React.createElement("div", { className: "overflow-x-auto" },
              React.createElement("table", { className: "min-w-full divide-y divide-gray-600" },
                React.createElement("thead", { className: "bg-gray-700/50" },
                  React.createElement("tr", null,
                    React.createElement("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider" }, "Código"),
                    React.createElement("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider" }, "Denominación"),
                    React.createElement("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider" }, "Cantidad")
                  )
                ),
                React.createElement("tbody", { className: "bg-gray-800 divide-y divide-gray-600" },
                  piezasRepuestas.map((pieza, index) => {
                    const [codigoCopied, setCodigoCopied] = useState(false);

                    const handleCopyCodigo = useCallback(() => {
                        if (navigator.clipboard && pieza.codigo) {
                            navigator.clipboard.writeText(pieza.codigo).then(() => {
                                setCodigoCopied(true);
                                setTimeout(() => setCodigoCopied(false), 2000);
                            });
                        }
                    }, [pieza.codigo]);

                    return (
                      React.createElement("tr", { key: index },
                        React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-300 flex items-center justify-between" },
                          React.createElement("span", { className: "flex-grow" }, pieza.codigo),
                          pieza.codigo && (
                              React.createElement("button", {
                                  onClick: handleCopyCodigo,
                                  className: "ml-2 p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500",
                                  "aria-label": `Copiar código ${pieza.codigo}`
                              },
                                  codigoCopied ? React.createElement(CheckIcon, { className: "w-4 h-4 text-green-400" }) : React.createElement(ClipboardIcon, { className: "w-4 h-4" })
                              )
                          )
                        ),
                        React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-300" }, pieza.denominacion),
                        React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-300" }, pieza.cantidad)
                      )
                    );
                  })
                )
              )
            )
          )
        )
      )
    )
  );
};
