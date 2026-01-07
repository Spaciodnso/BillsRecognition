
import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const formSchema = {
    type: Type.OBJECT,
    properties: {
      isWorkOrderForm: { type: Type.BOOLEAN, description: "True if the image is a work order form with a structure similar to the provided model, false otherwise." },
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
 * @throws {Error} If the image is not recognized as a valid work order form or if an API error occurs.
 */
export async function extractTextFromImage(base64ImageData, mimeType) {
  try {
    const imagePart = {
      inlineData: {
        data: base64ImageData,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: `Evalúa la imagen. Si es un 'parte de trabajo' similar al modelo proporcionado (formulario de servicio con Cliente, Fecha, Máquina/Modelo, tabla de Piezas Repuestas):
      - Establece 'isWorkOrderForm' en 'true' y extrae todo el texto (impreso y manuscrito) de cada campo, devolviendo un JSON según el schema. Transcribe la escritura a mano con precisión. Para 'piezasRepuestas', devuelve un array de objetos. Los campos vacíos deben ser null o cadenas vacías.
      - Si NO es un 'parte de trabajo' o no coincide con la estructura del modelo, establece 'isWorkOrderForm' en 'false' y deja los demás campos como null o cadenas vacías.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Optimized for speed
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: formSchema,
        thinkingConfig: { thinkingBudget: 0 }, // Prioritize speed
      }
    });
    
    const text = response.text;
    
    if (text === undefined) {
        throw new Error("The API response did not contain any text.");
    }
    
    const parsedData = JSON.parse(text);

    if (parsedData.isWorkOrderForm === false) {
      throw new Error("La imagen proporcionada no es un 'parte de trabajo' válido o no coincide con la estructura del modelo esperado.");
    }
    
    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw error; // Re-throw the specific error message, including the new validation error
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
}
