export interface Template {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  accentType: string;
  accentColor: string;
  bars: string[];
  src: string;
}

export const templates: Template[] = [
  {
    id: "CLASSIC",
    name: "CLASSIC",
    backgroundColor: "#F6F5F2",
    textColor: "#000000",
    borderColor: "#000000",
    accentType: "mountains",
    accentColor: "#00000010",
    bars: ["#E2C275", "#6886C5", "#CD5656", "#AEDADD", "#BCBAB8"],
    src: "classic-template",
  },
  {
    id: "MODERN",
    name: "MODERN",
    backgroundColor: "#ff80ab",
    textColor: "#000000",
    borderColor: "#D1D5DB",
    accentType: "wave",
    accentColor: "#EEEEEE",
    bars: ["#196cff", "#ffd439", "#FF2929", "#0e6b45", "#1A73E8"],
    src: "pink-template",
  },
  {
    id: "NEON",
    name: "NEON",
    backgroundColor: "#000000",
    textColor: "#EEEEEE",
    borderColor: "#000000",
    accentType: "staircase",
    accentColor: "#EEEEEE",
    bars: ["#FF6500", "#0A5EB0", "#FFE5CF", "#FFE700", "#7A1CAC"],
    src: "neon-template",
  },
  {
    id: "YELLOW",
    name: "YELLOW",
    backgroundColor: "#FFCC00",
    textColor: "#000000",
    borderColor: "#000000",
    accentType: "circle",
    accentColor: "#000000",
    bars: ["#EB5B00", "#347433", "#C5172E", "#547792", "#F7CFD8"],
    src: "yellow-template",
  },
  {
    id: "GREEN",
    name: "GREEN",
    backgroundColor: "#0c6c45",
    textColor: "#EEEEEE",
    borderColor: "#000000",
    accentType: "staircase",
    accentColor: "#000000",
    bars: ["#feb9d0", "#ff403d", "#196cff", "#ffc739", "#C886E5"],
    src: "green-template",
  },
  {
    id: "PASTEL",
    name: "PASTEL",
    backgroundColor: "#DDDAD0",
    textColor: "#000000",
    borderColor: "#000000",
    accentType: "donut",
    accentColor: "#000000",
    bars: ["#DA6C6C", "#687FE5", "#A7C1A8", "#9B7EBD", "#E6B2BA"],
    src: "pastel-template",
  },
  {
    id: "BLUE",
    name: "BLUE",
    backgroundColor: "#196aff",
    textColor: "#EEEEEE",
    borderColor: "#EEEEEE",
    accentType: "slash",
    accentColor: "#EEEEEE",
    bars: ["#C5172E", "#FDFAF6", "#FFCC00", "#1DCD9F", "#000000"],
    src: "blue-template",
  },
];
