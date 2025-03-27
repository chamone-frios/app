/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { CSSProperties } from 'react';

import { createAppTheme } from './create-theme';

import '@fontsource/roboto';

import { digitalScheme } from './theme-digital';

import type { midasVariants } from './base';
import type { commonMidasColors, digitalBase, thema } from './theme-digital';

export type { SxProps, ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    'hero-lg': CSSProperties;
    'hero-md': CSSProperties;
    'hero-sm': CSSProperties;
  }

  interface TypographyVariantsOptions {
    'hero-lg'?: CSSProperties;
    'hero-md'?: CSSProperties;
    'hero-sm'?: CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    'hero-lg': true;
    'hero-md': true;
    'hero-sm': true;
  }
}

declare module '@mui/system/createTheme/shape' {
  interface Shape {
    'radius-circle': string;
    'radius-md': string;
    'radius-sm': string;
    circle: string;
    md: string;
    sm: string;
    'width-bold': string;
    'width-heavy': string;
    'width-medium': string;
    'width-thin': string;
  }
}
declare module '@mui/system' {
  interface Shape {
    'radius-circle': string;
    'radius-md': string;
    'radius-sm': string;
    accent: string;
    alert: string;
    info: string;
    primary: string;
    secondary: string;
    success: string;
    warning: string;
  }
}
declare module '@mui/system' {
  interface Shape {
    circle: string;
    md: string;
    sm: string;
    bold: string;
    heavy: string;
    medium: string;
    thin: string;
  }
}
declare module '@mui/system' {
  interface Shape {
    'radius-circle': string;
    'radius-md': string;
    'radius-sm': string;
    circle: string;
    md: string;
    sm: string;
    bold: string;
    heavy: string;
    medium: string;
    thin: string;
  }
}
type TextStyle =
  | 'hero'
  | 'title-sm'
  | 'title-md'
  | 'title-lg'
  | 'subtitle-sm'
  | 'subtitle-md'
  | 'body-sm'
  | 'body-md'
  | 'body'
  | 'button'
  | 'label'
  | 'input'
  | 'overline'
  | 'functional-sm'
  | 'functional-md'
  | 'functional-sm-highlight'
  | 'link-sm'
  | 'link-md';

type Variants = Record<TextStyle, CSSProperties>;
declare module '@mui/material/styles' {
  interface ColorSchemeOverrides {
    'light-alternative': true;
    'dark-alternative': true;
    'light-brand': true;
    'dark-brand': true;
  }

  interface TypographyVariants extends Variants {}
}
export type SingularBaseType = typeof digitalBase;
export type BaseMidasColorsType = typeof thema;
export type CommonMidasColorsType = typeof commonMidasColors;
export type MidasPaletteType = BaseMidasColorsType &
  CommonMidasColorsType &
  SingularBaseType;

declare module '@mui/material/styles/createPalette' {
  interface Palette extends MidasPaletteType {}
  interface PaletteOptions extends MidasPaletteType {}
}

declare module '@mui/material/styles/createTypography' {
  interface TypographyOptions
    extends Partial<
      Record<midasVariants, TypographyStyleOptions> &
        Record<Variant, TypographyStyleOptions> &
        FontStyleOptions
    > {}

  interface Typography
    extends Record<midasVariants, TypographyStyleOptions>,
      Record<Variant, TypographyStyle>,
      FontStyle,
      TypographyUtils {}
}

const theme = createAppTheme({ scheme: digitalScheme });

export { theme };
