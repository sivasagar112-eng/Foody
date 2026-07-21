// src/utils/theme.ts
export const theme = {
  colors: {
    primary: '#E23744', // Swiggy/Zomato Red
    primaryDark: '#B91C1C',
    primaryLight: '#FFEBEC',
    secondary: '#2D3033', // Charcoal dark text
    secondaryLight: '#686B6E', // Muted text
    background: '#FFFFFF',
    backgroundAlt: '#F4F6FB', // Muted card background
    border: '#E4E8F0',
    white: '#FFFFFF',
    black: '#000000',
    veg: '#0F8A5F', // Green
    nonveg: '#C93B3B', // Red
    gold: '#FFC72C', // Review rating yellow
    goldLight: '#FFF9E6',
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  shadows: {
    light: 'shadow-sm',
    medium: 'shadow',
    large: 'shadow-lg',
  }
};
export type ThemeColors = typeof theme.colors;
