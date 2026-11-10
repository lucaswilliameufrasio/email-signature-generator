import { describe, expect, it } from "vitest";
import { emailHref, instagramHref, linkedinHref, phoneHref, websiteHref } from "./contact-links";

describe("contact links", function () {
  it("builds tel links from formatted numbers", function () {
    expect(phoneHref("+55 (11) 91234-5678")).toBe("tel:+5511912345678");
    expect(phoneHref("(11) 91234-5678")).toBe("tel:11912345678");
    expect(phoneHref("123")).toBeUndefined();
  });

  it("builds mailto links only for plausible addresses", function () {
    expect(emailHref(" maria@empresa.com ")).toBe("mailto:maria@empresa.com");
    expect(emailHref("maria@empresa")).toBeUndefined();
    expect(emailHref("not an email")).toBeUndefined();
  });

  it("adds https to websites without protocol", function () {
    expect(websiteHref("www.empresa.com")).toBe("https://www.empresa.com/");
    expect(websiteHref("http://empresa.com/contato")).toBe("http://empresa.com/contato");
    expect(websiteHref("javascript:alert(1)")).toBeUndefined();
    expect(websiteHref("localhost")).toBeUndefined();
  });

  it("accepts LinkedIn profile URLs or handles", function () {
    expect(linkedinHref("linkedin.com/in/maria-silva")).toBe("https://linkedin.com/in/maria-silva");
    expect(linkedinHref("maria-silva")).toBe("https://www.linkedin.com/in/maria-silva");
    expect(linkedinHref("maria silva")).toBeUndefined();
  });

  it("accepts Instagram URLs or handles", function () {
    expect(instagramHref("@empresa.oficial")).toBe("https://www.instagram.com/empresa.oficial");
    expect(instagramHref("https://instagram.com/empresa")).toBe("https://instagram.com/empresa");
    expect(instagramHref("bad handle!")).toBeUndefined();
  });
});
