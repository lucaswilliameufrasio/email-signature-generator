import { describe, expect, it } from "vitest";
import { formatPhoneLine } from "./phone";

describe("formatPhoneLine", function () {
  it("prefixes the phone number when the country code is shown", function () {
    expect(formatPhoneLine("+55 (11) 91234-5678", true, "Telefone: ")).toBe("Telefone: +55 (11) 91234-5678");
  });

  it("removes the leading country code when it is hidden", function () {
    expect(formatPhoneLine("+55 (11) 91234-5678", false, "Telefone: ")).toBe("Telefone: (11) 91234-5678");
  });

  it("keeps the prefix when the phone is empty", function () {
    expect(formatPhoneLine("", true, "Phone: ")).toBe("Phone: ");
  });

  it("currently removes the area code of a number without country code", function () {
    expect(formatPhoneLine("11 91234-5678", false, "Telefone: ")).toBe("Telefone: 91234-5678");
  });
});
