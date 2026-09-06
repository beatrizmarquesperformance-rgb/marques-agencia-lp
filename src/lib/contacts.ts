import type { Contact, SiteSettings } from "@/lib/types";

/** Booking contacts, primary first. */
export function contactList(s: SiteSettings): Contact[] {
  const list: Contact[] = [{ name: s.contactName, phone: s.contactPhone }];
  if (s.contactName2 && s.contactPhone2) {
    list.push({ name: s.contactName2, phone: s.contactPhone2 });
  }
  return list;
}

export const telHref = (phone: string) => `tel:+351${phone.replace(/\D/g, "")}`;
