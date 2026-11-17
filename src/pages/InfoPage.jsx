import { Link, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import SafeImage from '../components/common/SafeImage.jsx';

export default function InfoPage({ section = 'help' }) {
  const { topic } = useParams();
  const { storeSettings } = useStore();
  const currency = storeSettings.currency || 'PKR';

  if (section === 'story') {
    return (
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-3xl mb-10">
          <p className="text-sm font-medium text-[#8C5A36] uppercase tracking-wider mb-2">
            About Creating Leather Goods
          </p>
          <h1 className="text-[34px] md:text-[48px] font-bold tracking-tight text-[#17130F] mb-4">
            Made with care. Built to last.
          </h1>
          <p className="text-base text-[#625D57] leading-relaxed">
            Founded with a focus on quiet utility and enduring hides, Creating Leather Goods works with experienced pattern makers, last builders, and leather artisans to produce small-batch footwear, outerwear, wallets, and travel bags designed for years of daily life.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-12">
          <div className="aspect-[4/3] bg-[#F3F1ED] border border-[#E6E2DC] overflow-hidden">
            <SafeImage
              src="/src/assets/images/workshop_craftsmanship_1794844438224.webp"
              alt="Creating Leather Goods workshop bench"
              fallbackTitle="Workshop Craftsmanship"
              className="w-full h-full object-cover"
            />
          </div>
          <div id="craftsmanship" className="bg-[#F3F1ED] border border-[#E6E2DC] p-8 flex flex-col justify-center space-y-4">
            <h2 className="text-2xl font-semibold text-[#17130F]">
              Material & Construction Discipline
            </h2>
            <p className="text-base text-[#625D57] leading-relaxed">
              We choose full-grain hides rather than corrected or split leather so the natural fiber structure stays intact. Shoes are Goodyear- or Blake-stitched for resoling, jacket seams are reinforced around high-tension shoulders, and wallets are hand-skived and burnished with beeswax.
            </p>
            <div>
              <Link
                to="/shop"
                className="inline-block px-6 py-3 bg-[#241811] text-white text-sm font-medium hover:bg-[#3A281E] transition-colors"
              >
                Explore the Collection
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const contentMap = {
    contact: {
      title: 'Contact Our Atelier',
      body: `Reach us directly for sizing questions, custom gift notes, or existing Cash on Delivery orders. Phone: ${storeSettings.contactPhone} · Email: ${storeSettings.email} · Address: ${storeSettings.address}.`,
    },
    delivery: {
      title: 'Delivery Across Pakistan',
      body: `Orders placed via Cash on Delivery are confirmed on WhatsApp before dispatch. Standard nationwide delivery is ${formatPrice(storeSettings.deliveryCharge, currency)}, and orders above ${formatPrice(storeSettings.freeDeliveryThreshold, currency)} ship free. Typical transit time is 2–4 working days.`,
    },
    returns: {
      title: 'Returns & Size Exchanges',
      body: 'Unworn shoes, jackets, wallets, and bags in original packaging may be exchanged within 7 days of delivery. Contact our team on WhatsApp with your Order ID to arrange pickup.',
    },
    faqs: {
      title: 'Frequently Asked Questions',
      body: 'All pieces are crafted from genuine full-grain leather. When you place an order at checkout, your order is recorded as Pending and WhatsApp opens with your summary so our team can confirm size and address before shipping.',
    },
    privacy: {
      title: 'Privacy Policy',
      body: 'Delivery details entered at checkout are used strictly to prepare your order and coordinate Cash on Delivery courier dispatch. In this frontend prototype, data stays in your browser storage.',
    },
    terms: {
      title: 'Terms and Conditions',
      body: 'Orders remain in Pending status until verified via WhatsApp message confirmation. Prices are listed in PKR and include applicable local craftsmanship taxes.',
    },
  };

  const entry = contentMap[topic] || contentMap.contact;
  const whatsappClean = String(storeSettings.whatsappNumber || '923001234567').replace(/[^\d]/g, '');

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16">
      <p className="text-sm font-medium text-[#8C5A36] uppercase tracking-wider mb-2">
        Customer Care
      </p>
      <h1 className="text-[32px] md:text-[40px] font-bold tracking-tight text-[#17130F] mb-5">
        {entry.title}
      </h1>
      <div className="border border-[#E6E2DC] bg-[#F3F1ED] p-6 md:p-8 space-y-5">
        <p className="text-base text-[#17130F] leading-relaxed">{entry.body}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href={`https://wa.me/${whatsappClean}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#241811] text-white text-sm font-medium hover:bg-[#3A281E] transition-colors"
          >
            Message on WhatsApp
          </a>
          <Link
            to="/shop"
            className="px-6 py-3 border border-[#17130F] bg-white text-[#17130F] text-sm font-medium hover:bg-[#E8DCCB] transition-colors"
          >
            Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
