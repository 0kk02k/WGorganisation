// Bild clientseitig komprimieren: max. 1200px Kante, JPEG mit 80% Qualität.
// Genutzt vom How-to-Dialog (Anlegen) und der Detailansicht (Bearbeiten),
// damit Uploads nicht an der 5MB-Grenze scheitern.
const MAX_EDGE = 1200;
const QUALITY = 0.8;

export const IMAGE_DATA_MAX_BYTES = 5 * 1024 * 1024; // 5MB als Base64

export const compressImageFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Bild konnte nicht gelesen werden."));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Bild konnte nicht geöffnet werden."));
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_EDGE || height > MAX_EDGE) {
          if (width > height) {
            height = (height / width) * MAX_EDGE;
            width = MAX_EDGE;
          } else {
            width = (width / height) * MAX_EDGE;
            height = MAX_EDGE;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
