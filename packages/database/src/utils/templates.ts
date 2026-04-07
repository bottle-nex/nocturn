import { TemplateEnum } from "../../generated/client";

export interface Template {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  accentType: string;
  accentColor: string;
  itemsColor: string;
  itemsTextColor: string;
  buttonColor: string;
  buttonTextColor: string;
  bars: string[];
  src: string;
}

export const templates: Template[] = [
  {
    id: "CLASSIC",
    name: TemplateEnum.CLASSIC,
    backgroundColor: "#F6F5F2",
    textColor: "#000000",
    borderColor: "#000000",
    accentType: "mountains",
    accentColor: "#00000010",
    itemsColor: "",
    itemsTextColor: "#000000",
    buttonColor: "#000000",
    buttonTextColor: "#FFFFFF",
    bars: ["#E2C275", "#6886C5", "#CD5656", "#AEDADD", "#BCBAB8"],
    src: "classic-template",
  },
  {
    id: "MODERN",
    name: TemplateEnum.MODERN,
    backgroundColor: "#ff80ab",
    textColor: "#000000",
    borderColor: "#D1D5DB",
    accentType: "wave",
    accentColor: "#EEEEEE",
    itemsColor: "",
    itemsTextColor: "#000000",
    buttonColor: "#000000",
    buttonTextColor: "#FFFFFF",
    bars: ["#196cff", "#ffd439", "#FF2929", "#0e6b45", "#1A73E8"],
    src: "pink-template",
  },
  {
    id: "NEON",
    name: TemplateEnum.NEON,
    backgroundColor: "#000000",
    textColor: "#EEEEEE",
    borderColor: "#000000",
    accentType: "staircase",
    accentColor: "#EEEEEE",
    itemsColor: "",
    itemsTextColor: "#EEEEEE",
    buttonColor: "#EEEEEE",
    buttonTextColor: "#000000",
    bars: ["#FF6500", "#0A5EB0", "#FFE5CF", "#FFE700", "#7A1CAC"],
    src: "neon-template",
  },
  {
    id: "YELLOW",
    name: TemplateEnum.YELLOW,
    backgroundColor: "#FFCC00",
    textColor: "#000000",
    borderColor: "#000000",
    accentType: "circle",
    accentColor: "#000000",
    itemsColor: "",
    itemsTextColor: "#000000",
    buttonColor: "#000000",
    buttonTextColor: "#FFCC00",
    bars: ["#EB5B00", "#347433", "#C5172E", "#547792", "#F7CFD8"],
    src: "yellow-template",
  },
  {
    id: "GREEN",
    name: TemplateEnum.GREEN,
    backgroundColor: "#0c6c45",
    textColor: "#EEEEEE",
    borderColor: "#000000",
    accentType: "staircase",
    accentColor: "#000000",
    itemsColor: "",
    itemsTextColor: "#EEEEEE",
    buttonColor: "#EEEEEE",
    buttonTextColor: "#0c6c45",
    bars: ["#feb9d0", "#ff403d", "#196cff", "#ffc739", "#C886E5"],
    src: "green-template",
  },
  {
    id: "PASTEL",
    name: TemplateEnum.PASTEL,
    backgroundColor: "#DDDAD0",
    textColor: "#000000",
    borderColor: "#000000",
    accentType: "donut",
    accentColor: "#000000",
    itemsColor: "",
    itemsTextColor: "#000000",
    buttonColor: "#000000",
    buttonTextColor: "#DDDAD0",
    bars: ["#DA6C6C", "#687FE5", "#A7C1A8", "#9B7EBD", "#E6B2BA"],
    src: "pastel-template",
  },
  {
    id: "BLUE",
    name: TemplateEnum.BLUE,
    backgroundColor: "#196aff",
    textColor: "#EEEEEE",
    borderColor: "#EEEEEE",
    accentType: "slash",
    accentColor: "#EEEEEE",
    itemsColor: "",
    itemsTextColor: "#EEEEEE",
    buttonColor: "#EEEEEE",
    buttonTextColor: "#196aff",
    bars: ["#C5172E", "#FDFAF6", "#FFCC00", "#1DCD9F", "#000000"],
    src: "blue-template",
  },
];
