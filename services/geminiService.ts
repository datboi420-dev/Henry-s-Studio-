
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION, ISOLATE_INSTRUCTION } from "../constants";
import { ProcessingConfig } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductImage = async (config: ProcessingConfig): Promise<string> => {
  try {
    const { image, preset, customColor, aspectRatio } = config;

    // Remove data URL prefix if present for the API call
    const cleanBase64 = image.split(',')[1] || image;

    let backgroundDesc = preset.promptDescription;
    
    // If it's a custom color preset (conceptually), we might inject the specific hex
    if (customColor) {
      // User specifically requested a clean color background
      backgroundDesc = `a clean, solid, matte background with the color ${customColor}. Seamless studio paper backdrop. No textures, no patterns, just the solid color with realistic ground shadows`;
    }

    const prompt = `
      Create a professional e-commerce product photo based on this image.
      Action: Detect the main product and reconstruct any parts covered by hands or fingers.
      Target Background: ${backgroundDesc}.
      Product Placement: The product MUST be placed on a solid flat surface (tabletop) matching the background color. It must NOT be floating. Add realistic contact shadows on the ground.
      Camera Angle: Eye-level straight-on view.
      Style: High resolution, commercial photography, realistic lighting.
      CRITICAL REQUIREMENT: The background must be a SOLID COLOR (Seamless Studio Paper). DO NOT add visible walls, horizon lines, textures, or patterns. It must look like an infinite solid color backdrop.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Fast and good for image tasks
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        imageConfig: {
          aspectRatio: aspectRatio
        }
      }
    });

    // Check for image in response
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          // Return valid Data URI
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image generated.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const isolateProduct = async (imageBase64: string): Promise<string> => {
  try {
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;

    const prompt = "Generate a clean product shot of the main object in this image. Remove any hands holding it. Reconstruct the object where the hand was. Background: Pure White.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: { mimeType: 'image/jpeg', data: cleanBase64 }
          },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: ISOLATE_INSTRUCTION,
        imageConfig: {
            aspectRatio: '1:1' // Default to square for preview isolation
        }
      }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("Isolation failed");
  } catch (error) {
    console.error("Isolation Error:", error);
    throw error;
  }
};
