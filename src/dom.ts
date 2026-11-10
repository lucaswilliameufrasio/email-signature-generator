type ElementConstructor<ElementType extends HTMLElement> = abstract new () => ElementType;

export function requireElement<ElementType extends HTMLElement>(
  elementId: string,
  constructor: ElementConstructor<ElementType>
): ElementType {
  const element = document.getElementById(elementId);
  if (!(element instanceof constructor)) {
    throw new Error(`Expected #${elementId} to be a ${constructor.name}`);
  }
  return element;
}
