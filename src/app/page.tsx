import Link from 'next/link';
import { PRODUCT_CATALOG } from '@/lib/catalog';
import { QrCode, ArrowRight, ShieldCheck, CreditCard, Sparkles, MapPin, Eye, Check } from 'lucide-react';

export default async function Home() {
  const featuredCategories = PRODUCT_CATALOG.slice(0, 6);

  return (
    <div className="bg-white">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-white border-b-2 border-primary py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-primary bg-white text-xs font-bold text-dark-charcoal">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span>Premium Quality Online Printing</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-dark-charcoal tracking-tight leading-none">
              Design and Print Your <br/>
              <span className="bg-gradient-to-r from-primary via-yellow-500 to-primary bg-clip-text text-transparent">Brand Identity</span>
            </h1>
            
            <p className="text-base sm:text-lg text-gray-600 font-semibold max-w-xl leading-relaxed">
              Create professional, customized business cards, stationery, apparel, and marketing materials. Edit online in real-time, generate scannable QR codes, and review in 3D.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/catalog" className="w-full sm:w-auto btn-primary py-3.5 px-8 text-sm shadow-md hover:shadow-lg">
                Browse Catalog
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/login" className="w-full sm:w-auto btn-secondary py-3.5 px-8 text-sm">
                Google Login
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative hidden lg:block h-[450px]">
            {/* Main Mockup: Model with Business Card */}
            <div className="absolute top-0 right-4 w-72 h-[380px] brand-card bg-white shadow-2xl rotate-2 transition-transform duration-300 hover:rotate-0 hover:scale-105 overflow-hidden z-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/ai_model_visiting_card.png" 
                alt="Model with Custom Business Card" 
                className="w-full h-[280px] object-cover" 
              />
              <div className="p-4 bg-white border-t border-primary/20">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Visiting Cards</span>
                <h3 className="font-extrabold text-sm text-dark-charcoal mt-0.5">Premium Matte Finish</h3>
              </div>
            </div>

            {/* Overlapping Mockup: Model with Custom Apparel */}
            <div className="absolute bottom-4 left-4 w-56 h-[260px] brand-card bg-white shadow-xl -rotate-6 transition-transform duration-300 hover:rotate-0 hover:scale-105 overflow-hidden z-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/ai_model_polo_tshirt.png" 
                alt="Model with Branded Apparel" 
                className="w-full h-[170px] object-cover" 
              />
              <div className="p-3 bg-white border-t border-primary/20">
                <span className="text-[9px] font-black text-primary uppercase tracking-widest block">Apparel & Caps</span>
                <h3 className="font-extrabold text-xs text-dark-charcoal mt-0.5">Custom Pique Polo Shirts</h3>
              </div>
            </div>

            {/* background circle decor */}
            <div className="absolute -top-10 -right-10 h-72 w-72 rounded-full bg-primary/15 -z-10 blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-primary/10 -z-10 blur-2xl"></div>
          </div>


        </div>
      </section>

      {/* 2. NFC Smart Keychain Promo Section */}
      <section className="py-16 bg-white border-t border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side: Premium Mockup Image */}
            <div className="lg:col-span-7 relative group">
              <div className="brand-card overflow-hidden bg-white shadow-xl transition-all duration-300 hover:shadow-2xl border-4 border-primary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/nfc_keychain_banner.png" 
                  alt="NFC Instagram Keychain Mockup" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" 
                />
              </div>
              
              {/* Overlay highlight badge */}
              <div className="absolute -top-3 -left-3 bg-primary text-dark-charcoal px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border-2 border-dark-charcoal shadow-md">
                Smart NFC Integration
              </div>
            </div>

            {/* Right side: Detailed Feature Text */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-primary bg-yellow-50/50 text-[10px] font-black uppercase tracking-wider text-dark-charcoal">
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span>Trending Product</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-black text-dark-charcoal tracking-tight leading-tight">
                Tap. Share. Connect. <br/>
                <span className="text-primary">Your Instagram on a Keychain</span>
              </h2>

              <ul className="space-y-4 text-sm text-gray-600 font-semibold text-left">
                <li className="flex items-start gap-3">
                  <div className="bg-primary/20 p-1 rounded-full mt-0.5 flex-shrink-0">
                    <Check className="h-4 w-4 text-primary stroke-[3px]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-dark-charcoal text-base">No searching. No scanning.</h4>
                    <p className="text-xs text-gray-500 font-bold mt-0.5">No QR codes required. Share your profile directly with a physical touch.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/20 p-1 rounded-full mt-0.5 flex-shrink-0">
                    <Check className="h-4 w-4 text-primary stroke-[3px]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-dark-charcoal text-base">Just tap your NFC keychain</h4>
                    <p className="text-xs text-gray-500 font-bold mt-0.5">Built-in high-quality microchip redirects phones instantly to your social link.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/20 p-1 rounded-full mt-0.5 flex-shrink-0">
                    <Check className="h-4 w-4 text-primary stroke-[3px]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-dark-charcoal text-base">Connect instantly</h4>
                    <p className="text-xs text-gray-500 font-bold mt-0.5">Compatible with modern iOS and Android smartphones out-of-the-box.</p>
                  </div>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link href="/product/keychains" className="w-full sm:w-auto btn-primary py-3 px-8 text-sm font-extrabold shadow-md hover:shadow-lg uppercase tracking-wider">
                  Design Yours Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/catalog?category=Stationery" className="w-full sm:w-auto btn-secondary py-3 px-8 text-sm font-extrabold uppercase tracking-wider">
                  Browse All Gear
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

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
