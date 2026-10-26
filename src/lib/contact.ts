/** Public contact details for the landing site. Fill these in once: empty values show a "coming soon" button. whatsapp = digits only with country code (e.g. 972501234567). */
export const CONTACT = { whatsapp: '972549995858', email: 'office@myfamilycareclub.com', phone: '' }

const hello = encodeURIComponent('שלום, אשמח לשמוע עוד על מועדון Family Care')
const subject = encodeURIComponent('התעניינות במועדון Family Care')

export const waHref = CONTACT.whatsapp ? `https://wa.me/${CONTACT.whatsapp}?text=${hello}` : null
export const mailHref = CONTACT.email ? `mailto:${CONTACT.email}?subject=${subject}` : null
export const telHref = CONTACT.phone ? `tel:${CONTACT.phone}` : null
