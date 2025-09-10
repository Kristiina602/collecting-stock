// Export all SVG icons for easy importing
export { default as mushrooms } from './mushrooms.svg';
export const berry = '🍓';
export { default as trash } from './trash.svg';
export { default as refresh } from './refresh.svg';
export { default as box } from './box.svg';

// Icon name type for type safety
export type IconName = 
  | 'mushrooms' 
  | 'berry' 
  | 'trash' 
  | 'refresh' 
  | 'box';
