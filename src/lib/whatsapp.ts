import { SUPPORT_WHATSAPP } from '../../shared/catalog';

export const whatsappLink = (message: string) =>
  `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
