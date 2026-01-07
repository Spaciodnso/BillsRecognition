
import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const formSchema = {
    type: Type.OBJECT,
    properties: {
      cliente: { type: Type.STRING, description: "El nombre del cliente. Ejemplo: PINSIMON" },
      albaran: { type: Type.STRING, description: "El número de albarán. Puede estar vacío." },
      fecha: { type: Type.STRING, description: "La fecha del documento. Ejemplo: 5-9-25" },
      direccion: { type: Type.STRING, description: "La dirección del cliente. Puede estar vacía." },
      maquinaModelo: { type: Type.STRING, description: "El modelo de la máquina. Ejemplo: MAQUINA DE VACIO" },
      nSerie: { type: Type.STRING, description: "El número de serie. Ejemplo: FP 12302" },
      aviso: { type: Type.STRING, description: "El campo aviso. Puede estar vacío." },
      motivoAviso: { type: Type.STRING, description: "El motivo del aviso. Ejemplo: PREPARAR PARA HACER DOSIFICACION..." },
      reparacionEfectuada: { type: Type.STRING, description: "La reparación efectuada. Ejemplo: AUT. (SEÑALES DE DESCARGA...)" },
      observaciones: { type: Type.STRING, description: "Las observaciones. Ejemplo: *TIENE LA SEGURIDAD ATRAPADO..." },
      lugarReparacion: { type: Type.STRING, description: "El lugar de reparación, si 'Instalaciones del cliente' o 'Nuestro taller' está marcado." },
      piezasRepuestas: {
        type: Type.ARRAY,
        description: "Lista de piezas de repuesto.",
        items: {
          type: Type.OBJECT,
          properties: {
            codigo: { type: Type.STRING },
            denominacion: { type: Type.STRING },
            cantidad: { type: Type.STRING }, // Using string for safety
          }
        }
      },
      km: { type: Type.STRING },
      tiempoDesplazamiento: { type: Type.STRING },
      horarioManana: { type: Type.STRING },
      tecnico: { type: Type.STRING, description: "El nombre del técnico. Ejemplo: ANTONIO" },
      vehiculo: { type: Type.STRING, description: "El número del vehículo. Ejemplo: 1609CSG" },
    },
};

/**
 * Extracts structured text from a form image using the Gemini API.
 * @param base64ImageData The base64 encoded image data.
 * @param mimeType The MIME type of the image (e.g., 'image/png').
 * @returns The extracted data as a structured object.
 */
export async function extractTextFromImage(base64ImageData: string, mimeType: string): Promise<any> {
  try {
    const imagePart = {
      inlineData: {
        data: base64ImageData,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: "Analiza la imagen de este parte de trabajo. Extrae todo el texto, tanto impreso como manuscrito, de cada campo y devuélvelo como un objeto JSON estructurado según el schema. Presta especial atención a la escritura a mano para transcribirla con la mayor precisión posible. Si un campo está vacío, devuelve una cadena vacía o null para ese campo. Para 'piezasRepuestas', devuelve un array de objetos.",
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: formSchema,
      }
    });
    
    const text = response.text;
    
    if (text === undefined) {
        throw new Error("The API response did not contain any text.");
    }
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
}
