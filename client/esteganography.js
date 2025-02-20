
class Esteganography {

    static MESSAGE_LENGTH = 256;
    static MESSAGE_END = "^^^^";

    /**
     * Recorta una matriz para que las dimensiones sean múltiplos de 8.
     * @param {number[][]} image - Matriz 2D de la imagen original.
     * @returns {number[][]} - Imagen recortada.
     */
    static cropToMultipleOf8(image) {
        const height = image.length;
        const width = image[0].length;
        const croppedHeight = Math.floor(height / 8) * 8;
        const croppedWidth = Math.floor(width / 8) * 8;

        return image.slice(0, croppedHeight).map((row) => row.slice(0, croppedWidth));
    }

     /**
     * Genera una matrix a partir de los datos rgba de un data image
     * @param {number[]} imageData - array image data original
     * @param {number} width - width original
     * @param {number} height - height original
     * @returns {number[][]} - matriz 2D de pixeles rgba
     */
     static imageDataToMatrix(imageData, width, height) {
        let matrix = [];
    
        for (let y = 0; y < height; y++) {
            let row = [];
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4; // Índice en el array unidimensional
    
                row.push({
                    r: imageData[index],      // Rojo
                    g: imageData[index + 1],  // Verde
                    b: imageData[index + 2],  // Azul
                    a: imageData[index + 3],  // Alfa
                });
            }
            matrix.push(row);
        }
    
        return matrix;
    }

    /**
     * Genera una data image a partir de los datos rgba de un matrix
     * @param {number[][]} - matriz 2D de pixeles rgba
     * @param {number} width - width original
     * @param {number} height - height original
     * @returns {number[]} imageData - array image data 
     */
    static matrixToImageData(matrix, width, height, ctx) {
        let imageData = ctx.createImageData(width, height);
        let pixels = imageData.data;
    
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const pixel = matrix[y][x];
    
                pixels[index] = pixel.r;
                pixels[index + 1] = pixel.g;
                pixels[index + 2] = pixel.b;
                pixels[index + 3] = pixel.a;
            }
        }
    
        return imageData;
    }
     
    /**
     * Inserta un mensaje en los coeficientes de DCT de los bloques.
     * @param {number[][]} image - Matriz 2D de la imagen original.
     * @param {string} message - Texto a insertar.
     * @returns {number[][]} - Imagen modificada con el mensaje oculto.
     */
    static insertMessage(image, message) {
        const croppedImage = Esteganography.cropToMultipleOf8(image);
        const blocks = Esteganography.divideIntoBlocks(croppedImage);

        const messageBase65 = Base65.encodeString(message) + Esteganography.MESSAGE_END;
        // Convertir el mensaje a binario
        const binaryMessage = messageBase65
            .split("")
            .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
            .join("");
        const messageBits = binaryMessage.split("").map(Number);

        let bitIndex = 0;

        for (var block of blocks) {
            const dctBlock = Esteganography.dct2D(block);

            for (let x = 0; x < 8; x++) {
                for (let y = 0; y < 8; y++) {
                    if (bitIndex < messageBits.length) {
                        // Insertar bit en el coeficiente de baja frecuencia
                        dctBlock[x][y] = Math.round(dctBlock[x][y]);
                        dctBlock[x][y] = (dctBlock[x][y] & ~1) | messageBits[bitIndex];
                        bitIndex++;
                    }
                }
            }
            block = Esteganography.idct2D(dctBlock);

            if (bitIndex >= messageBits.length) break;
        }

        return Esteganography.reconstructImageFromBlocks(blocks, croppedImage.length, croppedImage[0].length);
    }

    /**
     * Extrae un mensaje oculto de los coeficientes de DCT de los bloques.
     * @param {number[][]} image - Matriz 2D de la imagen con el mensaje oculto.
     * @returns {string} - Texto extraído.
     */
    static extractMessage(image) {
        const croppedImage = Esteganography.cropToMultipleOf8(image);
        const blocks = Esteganography.divideIntoBlocks(croppedImage);

        const binaryMessage = [];
        let bitIndex = 0;

        for (const block of blocks) {
            const dctBlock = Esteganography.dct2D(block);

            for (let x = 0; x < 8; x++) {
                for (let y = 0; y < 8; y++) {
                    if (bitIndex < Esteganography.MESSAGE_LENGTH * 8) {
                        binaryMessage.push(dctBlock[x][y] & 1);
                        bitIndex++;
                    }
                }
            }

            if (bitIndex >= Esteganography.MESSAGE_LENGTH * 8) break;
        }

        // Convertir bits a texto
        const chars = [];
        for (let i = 0; i < binaryMessage.length; i += 8) {
            const byte = binaryMessage.slice(i, i + 8).join("");
            chars.push(String.fromCharCode(parseInt(byte, 2)));
        }

        var messageBase65 = chars.join("");
        messageBase65 = messageBase65.substring(0, messageBase65.indexOf(Esteganography.MESSAGE_END));
        return Base65.decodeString(messageBase65);
    }

    /**
     * Divide una matriz en bloques de 8x8, rellenando si las dimensiones no son múltiplos de 8.
     * @param {number[][]} image - Matriz 2D de la imagen original.
     * @returns {number[][][]} - Array 3D donde cada elemento es un bloque 8x8.
     */
    static divideIntoBlocks(image) {
        const height = image.length;
        const width = image[0].length;
        const paddedHeight = Math.ceil(height / 8) * 8;
        const paddedWidth = Math.ceil(width / 8) * 8;

        // Rellenar con 0s si no es múltiplo de 8
        const paddedImage = Array.from({ length: paddedHeight }, (_, i) =>
            Array.from({ length: paddedWidth }, (_, j) =>
                i < height && j < width ? image[i][j] : 0
            )
        );

        // Dividir en bloques de 8x8
        const blocks = [];
        for (let i = 0; i < paddedHeight; i += 8) {
            for (let j = 0; j < paddedWidth; j += 8) {
                const block = [];
                for (let x = 0; x < 8; x++) {
                    block.push(paddedImage[i + x].slice(j, j + 8));
                }
                blocks.push(block);
            }
        }
        return blocks;
    }

    /**
     * Reconstruye una imagen a partir de bloques de 8x8.
     * @param {number[][][]} blocks - Array 3D con los bloques 8x8.
     * @param {number} originalHeight - Altura original de la imagen.
     * @param {number} originalWidth - Anchura original de la imagen.
     * @returns {number[][]} - Imagen reconstruida como una matriz 2D.
     */
    static reconstructImageFromBlocks(blocks, originalHeight, originalWidth) {
        const paddedHeight = Math.ceil(originalHeight / 8) * 8;
        const paddedWidth = Math.ceil(originalWidth / 8) * 8;
        const reconstructed = Array.from({ length: paddedHeight }, () =>
            Array(paddedWidth).fill(0)
        );

        let blockIndex = 0;
        for (let i = 0; i < paddedHeight; i += 8) {
            for (let j = 0; j < paddedWidth; j += 8) {
                const block = blocks[blockIndex++];
                for (let x = 0; x < 8; x++) {
                    for (let y = 0; y < 8; y++) {
                        reconstructed[i + x][j + y] = block[x][y];
                    }
                }
            }
        }

        // Recortar el relleno para devolver las dimensiones originales
        return reconstructed.slice(0, originalHeight).map((row) => row.slice(0, originalWidth));
    }


    /**
     * Realiza la Transformada Discreta de Coseno (DCT) en un bloque 2D.
     * @param {number[][]} block - Matriz 2D (NxN) que representa los píxeles del bloque.
     * @returns {number[][]} - Matriz 2D transformada (coeficientes DCT).
     */
    static dct2D(block) {
        const N = block.length;
        const dct = Array.from({ length: N }, () => Array(N).fill(0));
        const c = (u) => (u === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N));

        for (let u = 0; u < N; u++) {
            for (let v = 0; v < N; v++) {
                let sum = 0;
                for (let x = 0; x < N; x++) {
                    for (let y = 0; y < N; y++) {
                        sum += block[x][y] *
                            Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N)) *
                            Math.cos(((2 * y + 1) * v * Math.PI) / (2 * N));
                    }
                }
                dct[u][v] = c(u) * c(v) * sum;
            }
        }
        return dct;
    }

    /**
     * Realiza la Transformada Discreta de Coseno inversa (IDCT) en un bloque 2D.
     * @param {number[][]} dct - Matriz 2D (NxN) que contiene los coeficientes DCT.
     * @returns {number[][]} - Matriz 2D transformada de vuelta a espacio de píxeles.
     */
    static idct2D(dct) {
        const N = dct.length;
        const block = Array.from({ length: N }, () => Array(N).fill(0));
        const c = (u) => (u === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N));

        for (let x = 0; x < N; x++) {
            for (let y = 0; y < N; y++) {
                let sum = 0;
                for (let u = 0; u < N; u++) {
                    for (let v = 0; v < N; v++) {
                        sum += c(u) * c(v) * dct[u][v] *
                            Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N)) *
                            Math.cos(((2 * y + 1) * v * Math.PI) / (2 * N));
                    }
                }
                block[x][y] = sum;
            }
        }
        return block;
    }

    static getPixelsFromImage(imageHtml, callback)
    {
        const file = imageHtml.files[0];
        if (!file) {
            console.error("No image to work with");
            return null;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.getElementById("esteganographyCanvas");
                const ctx = canvas.getContext("2d");
    
                // Ajustar el tamaño del canvas a la imagen
                canvas.width = img.width;
                canvas.height = img.height;
    
                // Dibujar la imagen en el canvas
                ctx.drawImage(img, 0, 0);
    
                // Obtener los píxeles y pasarlos a insertMessage()
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = Esteganography.imageDataToMatrix(imageData.data, canvas.width, canvas.height); // Array de valores RGBA
    
                if (callback != null) callback(pixels);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
 
    static insertMessageInHtmlImage(originalImageInput, message, outputImageHtml, outputDownloadAHtml = null) {
        const file = originalImageInput.files[0];
        if (!file) {
            console.error("No image to work with");
            return null;
        }
    
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.getElementById("esteganographyCanvas");
                const ctx = canvas.getContext("2d");

                // Ajustar el tamaño del canvas a la imagen
                canvas.width = img.width;
                canvas.height = img.height;

                // Dibujar la imagen en el canvas
                ctx.drawImage(img, 0, 0);

                // Obtener los píxeles y pasarlos a insertMessage()
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = Esteganography.imageDataToMatrix(imageData.data, canvas.width, canvas.height);

                // Insertamos un mensaje oculto 
                const modifiedPixels = Esteganography.insertMessage(pixels, message);

                // Guardamos la imagen con los datos ocultos
                ctx.putImageData(Esteganography.matrixToImageData(modifiedPixels, canvas.width, canvas.height, ctx), 0, 0);

                // Convertimos el canvas a una imagen
                const imageUrl = canvas.toDataURL("image/png");
                outputImageHtml.src = imageUrl;
                if (outputDownloadAHtml != null) outputDownloadAHtml.href = imageUrl;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

}


class Base65 {
    static BASE65_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ+/-abcdefghijklmnopqrstuvwxyz";
    static BASE65_PADDING_CHAR = "_"; // Reemplazo de '=' para padding
    
     /**
     * Convierte un String a un string Base65.
     * @param {string} text - texto a codificar.
     * @returns {string} - Cadena codificada en Base65.
     */
    static encodeString(text) {
        const encoder = new TextEncoder();
        const encoded = Base65.encode(encoder.encode(text));
        return encoded;
    }

    /**
     * Decodifica un string Base65 al string original.
     * @param {string} encoded - Cadena en Base65 a decodificar.
     * @returns {string} - Datos decodificados en string.
     */
    static decodeString(encoded) {
        const decodedBytes  = Base65.decode(encoded);
        const decoder       = new TextDecoder();
        const decodedText   = decoder.decode(decodedBytes);
        return decodedText;
    }

    /**
     * Convierte un ArrayBuffer a un string Base65.
     * @param {Uint8Array} bytes - Datos en bytes a codificar.
     * @returns {string} - Cadena codificada en Base65.
     */
    static encode(bytes) {
        let output = "";
        let bitBuffer = 0, bitCount = 0;
    
        for (let byte of bytes) {
            bitBuffer = (bitBuffer << 8) | byte;
            bitCount += 8;
    
            while (bitCount >= 6) {
                bitCount -= 6;
                output += Base65.BASE65_ALPHABET[(bitBuffer >> bitCount) & 0b111111];
            }
        }
    
        if (bitCount > 0) {
            output += Base65.BASE65_ALPHABET[(bitBuffer << (6 - bitCount)) & 0b111111];
        }
    
        return output;
    }
    
    /**
     * Decodifica un string Base65 a un ArrayBuffer.
     * @param {string} encoded - Cadena en Base65 a decodificar.
     * @returns {Uint8Array} - Datos decodificados en bytes.
     */
    static decode(encoded) {
        encoded = encoded.replace(new RegExp(`\\${Base65.BASE65_PADDING_CHAR}+$`), ""); // Quitar padding
        let output = [];
        let bitBuffer = 0, bitCount = 0;

        for (let char of encoded) {
            let index = BASE65_ALPHABET.indexOf(char);
            if (index === -1) continue; // Ignora caracteres no válidos

            bitBuffer = (bitBuffer << 6) | index;
            bitCount += 6;

            while (bitCount >= 8) {
                bitCount -= 8;
                output.push((bitBuffer >> bitCount) & 0xFF);
            }
        }
    
        return new Uint8Array(output);
    }
} 