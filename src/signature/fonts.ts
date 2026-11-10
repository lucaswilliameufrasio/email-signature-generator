export type FontOption = {
  label: string;
  value: string;
};

export const fontOptions: readonly FontOption[] = [
  { label: "Arial", value: "Arial,Helvetica,sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS',Arial,sans-serif" },
  { label: "Segoe UI", value: "'Segoe UI',Tahoma,Arial,sans-serif" },
  { label: "Verdana", value: "Verdana,Geneva,sans-serif" },
  { label: "Tahoma", value: "'Tahoma',Arial,sans-serif" },
  { label: "Georgia", value: "'Georgia',serif" },
  { label: "Times New Roman", value: "'Times New Roman',Times,serif" }
];

export function isKnownFont(value: string): boolean {
  return fontOptions.some(function (option) {
    return option.value === value;
  });
}
