class Esteganography {

    static MESSAGE_END = "^^^^";
    static MESSAGE_LENGTH = CommonConfig.PASSWORD_MAX_LENGTH + Esteganography.MESSAGE_END.length;

    /**
     * Crops a matrix so that its dimensions are multiples of 8.
     * @param {number[][]} image - 2D matrix of the original image.
     * @returns {number[][]} - Cropped image.
     */
    static cropToMultipleOf8(image) {
        const croppedHeight = Math.floor(image.length / 8) * 8;
        const croppedWidth = Math.floor(image[0].length / 8) * 8;
        return image.slice(0, croppedHeight).map(row => row.slice(0, croppedWidth));
    }
     
    /**
     * Generates a matrix from the rgba data of an image data.
     * @param {number[]} imageData - original image data array.
     * @param {number} width - original width.
     * @param {number} height - original height.
     * @returns {number[][]} - 2D matrix of rgba pixels.
     */
    static imageDataToMatrix(imageData, width, height) {
        let matrix = [];
    
        for (let y = 0; y < height; y++) {
            let row = [];
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4; // Index in the one-dimensional array
    
                row.push({
                    r: imageData[index],      // Red
                    g: imageData[index + 1],  // Green
                    b: imageData[index + 2],  // Blue
                    a: imageData[index + 3],  // Alpha
                });
            }
            matrix.push(row);
        }
    
        return matrix;
    }

    /**
     * Generates image data from the rgba data of a matrix.
     * @param {number[][]} - 2D matrix of rgba pixels.
     * @param {number} width - original width.
     * @param {number} height - original height.
     * @returns {number[]} imageData - image data array.
     */
    static matrixToImageData(matrix, ctx) {
        const width = matrix[0].length;
        const height = matrix.length;
        let imageData = ctx.createImageData(width, height);
        let data = imageData.data;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let pixel = matrix[y][x];
                let i = (y * width + x) * 4;
                data[i] = pixel.r;
                data[i + 1] = pixel.g;
                data[i + 2] = pixel.b;
                data[i + 3] = pixel.a;
            }
        }
        return imageData;
    }

    /**
     * Performs the Discrete Cosine Transform (DCT) on a 2D block.
     * @param {number[][]} block - 2D matrix (NxN) representing the block's pixels.
     * @returns {number[][]} - Transformed 2D matrix (DCT coefficients).
     */
    static dct2D(block) {
        let N = block.length;
        let temp = new Array(N).fill(0).map(() => new Array(N).fill(0));
        let result = new Array(N).fill(0).map(() => new Array(N).fill(0));
    
        // Apply DCT to rows
        for (let i = 0; i < N; i++) {
            temp[i] = Esteganography.dct1D(block[i]);
        }
        // Apply DCT to columns
        for (let j = 0; j < N; j++) {
            let col = temp.map(row => row[j]);
            let dctCol = Esteganography.dct1D(col);
            for (let i = 0; i < N; i++) {
                result[i][j] = dctCol[i];
            }
        }
        return result;
    }

    static dct1D(vector) {
        const N = vector.length;
        let result = new Array(N).fill(0);
        const factor = Math.PI / (2 * N);
        
        for (let k = 0; k < N; k++) {
            let sum = 0;
            for (let n = 0; n < N; n++) {
                sum += vector[n] * Math.cos((2 * n + 1) * k * factor);
            }
            result[k] = sum * (k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N));
        }
        return result;
    }

    /**
     * Performs the Inverse Discrete Cosine Transform (IDCT) on a 2D block.
     * @param {number[][]} dct - 2D matrix (NxN) containing the DCT coefficients.
     * @returns {number[][]} - Transformed 2D matrix back to pixel space.
     */
    static idct2D(block) {
        let N = block.length;
        let temp = new Array(N).fill(0).map(() => new Array(N).fill(0));
        let result = new Array(N).fill(0).map(() => new Array(N).fill(0));
    
        // Apply IDCT to columns
        for (let j = 0; j < N; j++) {
            let col = block.map(row => row[j]);
            let idctCol = Esteganography.idct1D(col);
            for (let i = 0; i < N; i++) {
                temp[i][j] = idctCol[i];
            }
        }
        // Apply IDCT to rows
        for (let i = 0; i < N; i++) {
            result[i] = Esteganography.idct1D(temp[i]);
        }
        return result;
    }

    static idct1D(vector) {
        const N = vector.length;
        let result = new Array(N).fill(0);
        const factor = Math.PI / (2 * N);
        
        for (let n = 0; n < N; n++) {
            let sum = vector[0] * Math.sqrt(1 / N);
            for (let k = 1; k < N; k++) {
                sum += vector[k] * Math.sqrt(2 / N) * Math.cos((2 * n + 1) * k * factor);
            }
            result[n] = sum;
        }
        return result;
    }

    static splitRGBChannels(block) {
        let r = [], g = [], b = [];
        for (let i = 0; i < block.length; i++) {
            r[i] = [];
            g[i] = [];
            b[i] = [];
            for (let j = 0; j < block[i].length; j++) {
                r[i][j] = block[i][j].r;
                g[i][j] = block[i][j].g;
                b[i][j] = block[i][j].b;
            }
        }
        return { r, g, b };
    }
     
    static mergeRGBChannels(r, g, b, originalBlock) {
        let newBlock = [];
        for (let i = 0; i < r.length; i++) {
            newBlock[i] = [];
            for (let j = 0; j < r[i].length; j++) {
                newBlock[i][j] = {
                    r: Math.round(Math.max(0, Math.min(255, r[i][j]))),
                    g: Math.round(Math.max(0, Math.min(255, g[i][j]))),
                    b: Math.round(Math.max(0, Math.min(255, b[i][j]))),
                    a: originalBlock[i][j].a // Maintain transparency
                };
            }
        }
        return newBlock;
    }
     
    /**
     * Inserts a message into the DCT coefficients of the blocks.
     * @param {number[][]} image - 2D matrix of the original image.
     * @param {string} message - Text to insert.
     * @returns {number[][]} - Image modified with the hidden message.
     */
    static insertMessage(image, message) {  
        const messageBase65 = Base65.encodeString(message) + Esteganography.MESSAGE_END;
        // Convert the message to binary
        const binaryMessage = messageBase65
            .split("")
            .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
            .join("");

        let index = 0;
        for (let y = 0; y < image.length; y += 8) {
            for (let x = 0; x < image[y].length; x += 8) {
                if (index >= binaryMessage.length) return image;
    
                let block = image.slice(y, y + 8).map(row => row.slice(x, x + 8));
                 
                // Apply DCT to each channel
                let { r, g, b } = Esteganography.splitRGBChannels(block);
                let dctR = Esteganography.dct2D(r);
                let dctG = Esteganography.dct2D(g);
                let dctB = Esteganography.dct2D(b);
    
                // Only modify the least significant coefficient in the blue channel
                dctB[7][7] = (binaryMessage[index] === "1") ? 5 : -5;
                index++;
    
                // Apply IDCT to each channel
                let idctR = Esteganography.idct2D(dctR);
                let idctG = Esteganography.idct2D(dctG);
                let idctB = Esteganography.idct2D(dctB);

                // Reconstruct the block with colors
                let modifiedBlock = Esteganography.mergeRGBChannels(idctR, idctG, idctB, block);
                for (let i = 0; i < 8; i++) {
                    for (let j = 0; j < 8; j++) {
                        image[y + i][x + j] = modifiedBlock[i][j];
                    }
                }
            }
        }
        return image;
    }

    /**
     * Extracts a hidden message from the DCT coefficients of the blocks.
     * @param {number[][]} image - 2D matrix of the image with the hidden message.
     * @returns {string} - Extracted text.
     */
    static extractMessage(image) {
        let binaryMessage = '';

        for (let y = 0; y < image.length; y += 8) {
            for (let x = 0; x < image[y].length; x += 8) {
                if (binaryMessage.length >= Esteganography.MESSAGE_LENGTH * 8) break;

                let block = image.slice(y, y + 8).map(row => row.slice(x, x + 8));
                let { r, g, b } = Esteganography.splitRGBChannels(block);

                let dctBlock = Esteganography.dct2D(b); 
                binaryMessage += dctBlock[7][7] > 0 ? "1" : "0";
            }
        }

        var messageBase65 = binaryMessage.match(/.{8}/g).map(byte => String.fromCharCode(parseInt(byte, 2))).join(''); 
        messageBase65 = messageBase65.substring(0, messageBase65.indexOf(Esteganography.MESSAGE_END));
        return Base65.decodeString(messageBase65);
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
    
                // Adjust the canvas size to the image
                canvas.width = img.width;
                canvas.height = img.height;
    
                // Draw the image on the canvas
                ctx.drawImage(img, 0, 0);
    
                // Get the pixels and pass them to insertMessage()
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = Esteganography.imageDataToMatrix(imageData.data, canvas.width, canvas.height); // Array of RGBA values
    
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

                // Adjust the canvas size to the image
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw the image on the canvas
                ctx.drawImage(img, 0, 0);

                // Get the pixels and pass them to insertMessage()
                const imageDataOriginal  = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let pixels = Esteganography.imageDataToMatrix(imageDataOriginal .data, canvas.width, canvas.height);
                pixels = Esteganography.cropToMultipleOf8(pixels);

                // Adjust the canvas size to the image
                canvas.width = pixels[0].length;
                canvas.height = pixels.length; 

                // Insert a hidden message 
                const modifiedPixels = Esteganography.insertMessage(pixels, message);
                const imageDataTransformed = Esteganography.matrixToImageData(modifiedPixels, ctx);
                // Save the image with the hidden data
                ctx.putImageData(imageDataTransformed, 0, 0);

                // Convert the canvas to an image
                const imageUrl = canvas.toDataURL("image/png");
                outputImageHtml.src = imageUrl;
                if (outputDownloadAHtml != null) {
                    outputDownloadAHtml.href = imageUrl;
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

}


class Base65 {
    static BASE65_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ+/-abcdefghijklmnopqrstuvwxyz";
    static BASE65_PADDING_CHAR = "_"; // Replacement for '=' for padding
    
    /**
     * Converts a String to a Base65 string.
     * @param {string} text - text to encode.
     * @returns {string} - Base65 encoded string.
     */
    static encodeString(text) {
        const encoder = new TextEncoder();
        const encoded = Base65.encode(encoder.encode(text));
        return encoded;
    }

    /**
     * Decodes a Base65 string to the original string.
     * @param {string} encoded - Base65 string to decode.
     * @returns {string} - Decoded string data.
     */
    static decodeString(encoded) {
        const decodedBytes  = Base65.decode(encoded);
        const decoder       = new TextDecoder();
        const decodedText   = decoder.decode(decodedBytes);
        return decodedText;
    }

    /**
     * Converts an ArrayBuffer to a Base65 string.
     * @param {Uint8Array} bytes - Data bytes to encode.
     * @returns {string} - Base65 encoded string.
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
     * Decodes a Base65 string to an ArrayBuffer.
     * @param {string} encoded - Base65 string to decode.
     * @returns {Uint8Array} - Decoded byte data.
     */
    static decode(encoded) {
        encoded = encoded.replace(new RegExp(`\\${Base65.BASE65_PADDING_CHAR}+$`), ""); // Remove padding
        let output = [];
        let bitBuffer = 0, bitCount = 0;

        for (let char of encoded) {
            let index = Base65.BASE65_ALPHABET.indexOf(char);
            if (index === -1) continue; // Ignore invalid characters

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