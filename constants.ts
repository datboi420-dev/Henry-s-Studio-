
import { BackgroundPreset } from './types';

export const APP_NAME = "Henry's Studio";

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'studio_white',
    name: 'Pure White',
    color: '#FFFFFF',
    promptDescription: 'a solid pure white background (Hex #FFFFFF) with soft realistic ground shadows, no textures, no patterns. Seamless studio backdrop.',
    textColor: 'text-black'
  },
  {
    id: 'studio_offwhite',
    name: 'Off White',
    color: '#F9FAFB',
    promptDescription: 'a solid clean off-white background, matte finish, soft studio lighting. Seamless paper backdrop.',
    textColor: 'text-gray-800'
  },
  {
    id: 'studio_beige',
    name: 'Warm Beige',
    color: '#F5F5DC',
    promptDescription: 'a solid warm beige background, matte finish, clean studio look, no texture, no patterns.',
    textColor: 'text-gray-900'
  },
  {
    id: 'studio_latte',
    name: 'Latte',
    color: '#F5E6D3',
    promptDescription: 'a solid soft latte brown background, matte finish, premium earth tone, no texture. Seamless studio backdrop.',
    textColor: 'text-yellow-900'
  },
  {
    id: 'studio_cream',
    name: 'Cream',
    color: '#FFFDD0',
    promptDescription: 'a solid soft cream background, matte finish, high-key lighting. Seamless studio look.',
    textColor: 'text-yellow-900'
  },
  {
    id: 'studio_pebble',
    name: 'Pebble',
    color: '#E5E5E0',
    promptDescription: 'a solid warm grey pebble background, matte finish, organic tone, no texture. Seamless paper backdrop.',
    textColor: 'text-gray-800'
  },
  {
    id: 'studio_grey',
    name: 'Light Grey',
    color: '#E5E7EB',
    promptDescription: 'a solid light grey background, matte finish, neutral studio lighting. Seamless paper backdrop.',
    textColor: 'text-gray-800'
  },
  {
    id: 'studio_mist',
    name: 'Cool Mist',
    color: '#F1F5F9',
    promptDescription: 'a solid very pale cool grey-blue mist background, matte finish, airy feel. Seamless studio backdrop.',
    textColor: 'text-slate-800'
  },
  {
    id: 'studio_pink',
    name: 'Blush',
    color: '#FCE7F3',
    promptDescription: 'a solid pastel pink blush background, matte finish, soft lighting. Seamless paper backdrop.',
    textColor: 'text-pink-900'
  },
  {
    id: 'studio_peach',
    name: 'Pale Peach',
    color: '#FFE5B4',
    promptDescription: 'a solid soft pale peach background, matte finish, warm and inviting, no texture. Seamless studio backdrop.',
    textColor: 'text-orange-900'
  },
  {
    id: 'studio_lilac',
    name: 'Lilac',
    color: '#E9D5FF',
    promptDescription: 'a solid soft lilac purple background, matte finish, premium aesthetic. Seamless paper backdrop.',
    textColor: 'text-purple-900'
  },
  {
    id: 'studio_blue',
    name: 'Baby Blue',
    color: '#E0F2FE',
    promptDescription: 'a solid pastel blue background, matte finish, clean studio look. Seamless paper backdrop.',
    textColor: 'text-blue-900'
  },
  {
    id: 'studio_mint',
    name: 'Mint',
    color: '#D1FAE5',
    promptDescription: 'a solid soft mint green background, matte finish, fresh look, no texture. Seamless studio backdrop.',
    textColor: 'text-teal-900'
  },
  {
    id: 'studio_sage',
    name: 'Soft Sage',
    color: '#DCFCE7',
    promptDescription: 'a solid soft sage green background, matte finish, organic and clean, no plants, no texture. Seamless studio backdrop.',
    textColor: 'text-green-900'
  },
  {
    id: 'studio_slate',
    name: 'Slate',
    color: '#CBD5E1',
    promptDescription: 'a solid slate blue-grey background, matte finish, professional corporate look. Seamless studio backdrop.',
    textColor: 'text-slate-900'
  },
  {
    id: 'studio_black',
    name: 'Matte Black',
    color: '#111827',
    promptDescription: 'a solid deep matte black background with elegant rim lighting, no texture. Seamless infinite black.',
    textColor: 'text-white'
  }
];

export const SYSTEM_INSTRUCTION = `
You are an expert AI product photographer.
Input: A raw photo of a product.
Task: Generate a high-end e-commerce listing photo.
Rules:
1. Identify the main product.
2. REMOVE hands, fingers, and original background entirely.
3. If parts of the product were covered by hands, RECONSTRUCT them naturally.
4. PLACE the product on a FLAT SURFACE (table/floor).
5. GRAVITY IS REQUIRED. The product must NOT float in mid-air.
6. Camera Angle: Maintain a consistent eye-level or slightly elevated product photography angle.
7. ADD realistic contact shadows where the product touches the ground.
8. Background must be a seamless solid color studio backdrop (infinity curve). No horizon lines.
`;

export const ISOLATE_INSTRUCTION = `
You are a highly advanced product isolation AI.
Input: An image containing a product, possibly held by a hand or surrounded by clutter.
Task: Generate a pristine, studio-quality image of ONLY the product on a pure white background.
Rules:
1. IGNORE/REMOVE hands, fingers, arms, and props holding the item.
2. RECONSTRUCT any parts of the product obscured by fingers (inpainting).
3. CENTRALIZE the product in the frame.
4. OUTPUT must be on a #FFFFFF white background.
5. MAINTAIN the product's original perspective and details perfectly.
`;
