import { typography as text } from './theme-scale';

import type { TypographyStyleOptions } from '@mui/material/styles/createTypography';

export type midasVariants =
  | 'hero-lg'
  | 'hero-md'
  | 'hero-sm'
  | 'input'
  | 'label'
  | 'link-sm'
  | 'link-md'
  | 'title-sm'
  | 'title-md'
  | 'title-lg'
  | 'subtitle-lg'
  | 'subtitle-md'
  | 'body-sm'
  | 'body-md'
  | 'body'
  | 'button'
  | 'overline'
  | 'functional-sm'
  | 'functional-md'
  | 'functional-sm-highlight';

export const midasVariantRecords: Record<
  midasVariants,
  TypographyStyleOptions
> = {
  'hero-lg': {
    fontFamily: 'Roboto',
    fontSize: text.hero['lg-size'],
    lineHeight: text.hero['lg-line-height'],
    fontWeight: text.hero.weight,
    letterSpacing: text.hero['lg-letter-spacing'],
  },
  'hero-md': {
    fontFamily: 'Roboto',
    fontSize: text.hero['md-size'],
    lineHeight: text.hero['md-line-height'],
    fontWeight: text.hero.weight,
    letterSpacing: text.hero['letter-spacing'],
  },
  'hero-sm': {
    fontFamily: 'Roboto',
    fontSize: text.hero['sm-size'],
    lineHeight: text.hero['sm-line-height'],
    fontWeight: text.hero.weight,
    letterSpacing: text.hero['letter-spacing'],
  },
  'title-lg': {
    fontSize: text.title['lg-size'],
    lineHeight: text.title['lg-line-height'],
    fontWeight: text.title.weight,
    letterSpacing: text.title['letter-spacing'],
  },
  'title-md': {
    fontSize: text.title['md-size'],
    lineHeight: text.title['md-line-height'],
    fontWeight: text.title.weight,
    letterSpacing: text.title['letter-spacing'],
  },
  'title-sm': {
    fontSize: text.title['sm-size'],
    lineHeight: text.title['sm-line-height'],
    fontWeight: text.title.weight,
    letterSpacing: text.title['letter-spacing'],
  },
  'subtitle-lg': {
    fontSize: text.subtitle['lg-size'],
    lineHeight: text.subtitle['lg-line-height'],
    fontWeight: text.subtitle.weight,
    letterSpacing: text.subtitle['letter-spacing'],
  },
  'subtitle-md': {
    fontSize: text.subtitle['md-size'],
    lineHeight: text.subtitle['md-line-height'],
    fontWeight: text.subtitle.weight,
    letterSpacing: text.subtitle['letter-spacing'],
  },
  'body-sm': {
    fontSize: text.body['sm-size'],
    lineHeight: text.body['sm-line-height'],
    fontWeight: text.body.weight,
    letterSpacing: text.body['letter-spacing'],
  },
  'body-md': {
    fontSize: text.body['md-size'],
    lineHeight: text.body['md-line-height'],
    fontWeight: text.body.weight,
    letterSpacing: text.body['letter-spacing'],
  },
  body: {
    fontSize: text.body['md-size'],
    lineHeight: text.body['md-line-height'],
    fontWeight: text.body.weight,
    letterSpacing: text.body['letter-spacing'],
  },
  button: {
    fontFamily: text.button.family,
    fontSize: text.button['md-size'],
    lineHeight: text.button['md-line-height'],
    fontWeight: text.button.weight,
    letterSpacing: text.button['letter-spacing'],
  },
  label: {
    fontFamily: text.form['label-family'],
    fontSize: text.form['label-md-size'],
    lineHeight: text.form['label-md-line-height'],
    fontWeight: text.form['label-weight'],
    letterSpacing: text.form['label-letter-spacing'],
  },
  input: {
    fontFamily: text.form['input-family'],
    fontSize: text.form['input-size'],
    lineHeight: text.form['input-line-height'],
    fontWeight: text.form['input-filled-weight'],
    letterSpacing: text.form['input-letter-spacing'],
  },
  overline: {
    fontFamily: text.overline.family,
    fontSize: text.overline.size,
    lineHeight: text.overline['line-height'],
    fontWeight: text.overline.weight,
    letterSpacing: text.overline['letter-spacing'],
  },
  'functional-md': {
    fontFamily: text.functional.family,
    fontSize: text.functional['md-size'],
    lineHeight: text.functional['md-line-height'],
    fontWeight: text.functional.weight,
    letterSpacing: text.functional['letter-spacing'],
  },
  'functional-sm': {
    fontFamily: text.functional.family,
    fontSize: text.functional['sm-size'],
    lineHeight: text.functional['sm-line-height'],
    fontWeight: text.functional.weight,
    letterSpacing: text.functional['letter-spacing'],
  },
  'functional-sm-highlight': {
    fontFamily: text.functional.family,
    fontSize: text.functional['sm-size'],
    lineHeight: text.functional['sm-line-height'],
    fontWeight: text.functional['sm-highlight-weight'],
    letterSpacing: text.functional['letter-spacing'],
  },
  'link-md': {
    fontFamily: text.link.family,
    fontSize: text.link['md-size'],
    lineHeight: text.link['md-line-height'],
    fontWeight: text.link.weight,
    letterSpacing: text.link['letter-spacing'],
  },
  'link-sm': {
    fontFamily: text.link.family,
    fontSize: text.functional['sm-size'],
    lineHeight: text.functional['sm-line-height'],
    fontWeight: text.link.weight,
    letterSpacing: text.functional['letter-spacing'],
  },
};

export const brandTheme = {
  typography: {
    fontFamily: 'Roboto',
    ...midasVariantRecords,
  },
  shadows: ['none'],
};
