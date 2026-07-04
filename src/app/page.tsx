import Link from 'next/link';
import { PRODUCT_CATALOG } from '@/lib/catalog';
import { ArrowRight, ShieldCheck, CreditCard, Sparkles, MapPin } from 'lucide-react';
import HomeHeroSlider from '@/components/home-hero-slider';

export default async function Home() {
  const featuredCategories = PRODUCT_CATALOG.slice(0, 6);

  return (
    <div className="bg-white">
      {/* 1. Interactive Hero Slider */}
      <HomeHeroSlider />


      {/* 3. Featured Categories Grid */}
      <section className="py-16 bg-white border-t border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-black text-dark-charcoal">Shop By Category</h2>
              <p className="text-sm text-gray-500 font-semibold mt-1">
                Explore our catalog of custom-printed items
              </p>
            </div>
            <Link href="/catalog" className="text-sm font-bold text-dark-charcoal hover:text-primary flex items-center gap-1">
              View All Catalog <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCategories.map((category) => (
              <div key={category.slug} className="brand-card overflow-hidden flex flex-col h-[350px]">
                <div className="h-48 w-full bg-yellow-50 border-b border-primary relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-lg text-dark-charcoal">{category.name}</h3>
                    <p className="text-xs text-gray-500 font-semibold line-clamp-2 mt-1">{category.description}</p>
                  </div>
                  <Link
                    href={`/catalog?category=${category.name}`}
                    className="btn-primary py-2 text-xs"
                  >
                    Explore Items
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Trust and Tech stack highlights */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="brand-card bg-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border-4 border-primary">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black text-dark-charcoal">
              Start Designing Your Assets Today
            </h2>
            <p className="text-sm text-gray-500 font-bold leading-relaxed">
              Login securely using your Google Account, load your designs in our editor, choose finishing options (glossy/matte, corners, quantity), and make seamless payments via Razorpay or Cash on Delivery.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2 bg-yellow-50 border border-primary px-4 py-2.5 rounded-full text-xs font-bold text-dark-charcoal">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Google OAuth</span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-50 border border-primary px-4 py-2.5 rounded-full text-xs font-bold text-dark-charcoal">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>Razorpay & COD</span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-50 border border-primary px-4 py-2.5 rounded-full text-xs font-bold text-dark-charcoal">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Google Maps API</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
