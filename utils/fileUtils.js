
/**
 * Converts a File object to a base64 encoded string.
 * @param file The File object to convert.
 * @returns A promise that resolves with an object containing the base64 string and the file's MIME type.
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      // The result is a data URL like "data:image/png;base64,iVBORw0KGgo...".
      // We need to extract just the base64 part.
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error("Failed to extract base64 data from file."));
        return;
      }
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
  });
}
