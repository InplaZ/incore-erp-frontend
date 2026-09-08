type ClassValue =
  | string
  | false
  | null
  | undefined
  | Array<string | false | null | undefined>;

export function cn(...classes: ClassValue[]): string {
  return classes.flat().filter(Boolean).join(" ");
}
