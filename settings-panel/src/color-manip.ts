import Color from 'color';

export const darken = (clr: string, factor: number) => {
  const c = Color(clr);
  return c.darken(factor).toString();
};

export const lighten = (clr: string, factor: number) => {
  const c = Color(clr);
  return c.lighten(factor).toString();
};
