import { createTheme, CssVarsThemeOptions, Theme } from '@mui/material/styles';
import { handleBreakpoints } from '@mui/system';

import { brandTheme } from './base';
import * as B from './breakpoints';
import { ui } from './theme-scale';

export interface ThemeProps {
  theme: Theme;
}

export function createAppTheme({
  scheme,
}: {
  scheme: CssVarsThemeOptions['colorSchemes'];
}): Theme {
  return createTheme({
    cssVariables: {
      cssVarPrefix: 'dk',
      colorSchemeSelector: 'data-MM-section',
    },
    breakpoints: {
      values: {
        xl: B.desktopXl,
        lg: B.desktop,
        md: B.desktopSm,
        sm: B.tablet,
        xs: B.mobile,
      },
    },
    colorSchemes: scheme,
    typography: brandTheme.typography,
    spacing: [0, ...Object.values(ui.spaces)],
    unstable_sxConfig: {
      borderRadius: {
        style(props) {
          const { borderRadius, theme } = props;
          const styleFromPropValue = (propValueFinal: number) => {
            const value =
              theme.shape[`radius-${propValueFinal}`] ||
              theme.shape[`${propValueFinal}`] ||
              propValueFinal ||
              null;

            return {
              borderRadius: value,
            };
          };
          return handleBreakpoints(props, borderRadius, styleFromPropValue);
        },
      },
      borderWidth: {
        style(props) {
          const { borderWidth, theme } = props;
          const styleFromPropValue = (propValueFinal: number) => {
            const value =
              theme.shape[`width-${propValueFinal}`] ||
              theme.shape[`${propValueFinal}`] ||
              propValueFinal ||
              null;

            return {
              borderWidth: value,
            };
          };
          return handleBreakpoints(props, borderWidth, styleFromPropValue);
        },
      },
    },
  });
}
