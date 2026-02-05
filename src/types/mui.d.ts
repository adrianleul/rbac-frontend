import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    third: {
      main: string;
    };
  }
  interface PaletteOptions {
    third?: {
      main: string;
    };
  }
}

declare module "@mui/material/Grid" {
  interface GridPropsVariantOverrides {
    item: true;
  }
}
