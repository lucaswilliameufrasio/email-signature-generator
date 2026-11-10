export function formatPhoneLine(phone: string, showCountryCode: boolean, prefix: string): string {
  let phoneText = phone;
  if (!showCountryCode) {
    phoneText = phoneText.replace(/^\+?\d+\s*/, "");
  }
  return `${prefix}${phoneText}`;
}
