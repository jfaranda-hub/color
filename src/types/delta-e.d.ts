declare module "delta-e" {
  interface LABColor {
    L: number;
    A: number;
    B: number;
  }

  export function getDeltaE76(color1: LABColor, color2: LABColor): number;
  export function getDeltaE94(color1: LABColor, color2: LABColor): number;
  export function getDeltaE00(color1: LABColor, color2: LABColor): number;
}
