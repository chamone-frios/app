import type { Breakpoint } from '@mui/material/styles';

/**
 * Breakpoints
 */
enum BREAKPOINTS {
  DESKTOP_LARGE = 1920,
  DESKTOP = 1440,
  DESKTOP_SM = 1366,
  TABLET = 768,
  MOBILE = 0,
}

/**
 * Breakpoint key constants
 */
const BREAKPOINT_KEY: Record<keyof typeof BREAKPOINTS, Breakpoint> = {
  DESKTOP_LARGE: 'xl',
  DESKTOP: 'lg',
  DESKTOP_SM: 'md',
  MOBILE: 'xs',
  TABLET: 'sm',
};
export const DESKTOP_LARGE = BREAKPOINT_KEY.DESKTOP_LARGE;
export const DESKTOP = BREAKPOINT_KEY.DESKTOP;
export const DESKTOP_SM = BREAKPOINT_KEY.DESKTOP_SM;
export const MOBILE = BREAKPOINT_KEY.MOBILE;
export const TABLET = BREAKPOINT_KEY.TABLET;

/**
 * Breakpoints constants
 */
export const desktopXl = BREAKPOINTS.DESKTOP_LARGE;
export const desktop = BREAKPOINTS.DESKTOP;
export const desktopSm = BREAKPOINTS.DESKTOP_SM;
export const mobile = BREAKPOINTS.MOBILE;
export const tablet = BREAKPOINTS.TABLET;

/**
 * Breakpoints queries
 */
export const desktopUp = `@media (min-width: ${desktop}px)`;
export const desktopSmUp = `@media (min-width: ${desktopSm}px)`;
export const mobileUp = `@media (min-width: ${mobile}px)`;
export const tabletUp = `@media (min-width: ${tablet}px)`;
