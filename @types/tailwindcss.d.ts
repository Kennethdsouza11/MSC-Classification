// types/tailwindcss.d.ts
declare module 'tailwindcss/lib/util/flattenColorPalette' {
    import { PluginAPI } from 'tailwindcss/types/config';
    const flattenColorPalette: (colors: PluginAPI['theme']['colors']) => Record<string, string>;
    export default flattenColorPalette;
  }