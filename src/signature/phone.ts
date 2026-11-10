export function formatPhoneLine(phone: string, showCountryCode: boolean, prefix: string): string {
  let phoneText = phone.trim();
  if (phoneText === "") {
    return "";
  }
  if (!showCountryCode) {
    phoneText = phoneText.replace(/^\+\d{1,3}\s*/, "");
  }
  return `${prefix}${phoneText}`;
}
