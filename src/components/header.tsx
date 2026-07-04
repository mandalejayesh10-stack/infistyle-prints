'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PRODUCT_CATALOG, Category } from '@/lib/catalog';
import { ShoppingCart, User, Heart, Briefcase, Search, Menu, X, ChevronDown, LogOut } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isEditor = pathname?.startsWith('/editor');
  
  const [user, setUser] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Load cart count from localStorage
    const updateCartCount = () => {
      try {
        const storedCart = localStorage.getItem('infistyle_cart');
        if (storedCart) {
          const items = JSON.parse(storedCart);
          setCartCount(items.length);
        } else {
          setCartCount(0);
        }
      } catch (err) {
        console.error(err);
      }
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    const interval = setInterval(updateCartCount, 1000); // Poll as fallback

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', updateCartCount);
      clearInterval(interval);
    };
  }, [supabase]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfileDropdownOpen(false);
    router.push('/');
  };

  // We display the major categories directly in the main nav bar
  const mainCategories = PRODUCT_CATALOG;

  if (isEditor) return null;

  return (

    <header className="sticky top-0 z-50 bg-white border-b-2 border-primary shadow-sm">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <span className="text-3xl font-extrabold text-dark-charcoal tracking-tight">
              infi<span className="text-primary">style</span>
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg relative hidden md:block">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border-2 border-primary rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-dark-charcoal font-medium"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-primary hover:text-primary-hover">
              <Search className="h-5 w-5" />
            </button>
          </form>

          {/* Utility Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-dark-charcoal">
            {user ? (
              <Link href="/dashboard?tab=projects" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <Briefcase className="h-4.5 w-4.5" />
                <span>My Projects</span>
              </Link>
            ) : (
              <Link href="/login?next=/dashboard" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <Briefcase className="h-4.5 w-4.5" />
                <span>My Projects</span>
              </Link>
            )}

            <Link href="/dashboard?tab=favourites" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Heart className="h-4.5 w-4.5" />
              <span>Favourites</span>
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1 hover:text-primary transition-colors font-semibold"
                >
                  <User className="h-4.5 w-4.5" />
                  <span>Account</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-primary shadow-xl rounded-none z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 bg-yellow-50 border-b border-primary/20">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-black text-dark-charcoal truncate mt-0.5" title={user.email}>
                        {user.email}
                      </p>
                    </div>

                    {/* Navigation Links */}
                    <div className="py-1">
                      <Link
                        href="/dashboard?tab=overview"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-dark-charcoal hover:bg-yellow-50 font-black uppercase tracking-wider"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard?tab=projects"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-dark-charcoal hover:bg-yellow-50 font-black uppercase tracking-wider"
                      >
                        My Projects
                      </Link>
                      <Link
                        href="/dashboard?tab=orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-dark-charcoal hover:bg-yellow-50 font-black uppercase tracking-wider"
                      >
                        Order History & Reorder
                      </Link>
                      <Link
                        href="/dashboard?tab=addresses"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-dark-charcoal hover:bg-yellow-50 font-black uppercase tracking-wider"
                      >
                        Account Settings
                      </Link>
                    </div>

                    {/* Centered outlined Sign Out button */}
                    <div className="p-3 border-t border-primary/20 bg-gray-50 flex justify-center">
                      <button
                        onClick={handleLogout}
                        className="w-full text-center py-2 border-2 border-dark-charcoal text-dark-charcoal hover:bg-primary hover:border-primary text-xs font-black uppercase tracking-widest transition-all rounded-none cursor-pointer"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <User className="h-4.5 w-4.5" />
                <span>Account</span>
              </Link>
            )}

            <Link href="/cart" className="relative flex items-center gap-1.5 hover:text-primary transition-colors">
              <ShoppingCart className="h-4.5 w-4.5" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-3 -right-3.5 bg-primary text-dark-charcoal text-xs font-bold px-2 py-0.5 rounded-full border border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-4">
            <Link href="/cart" className="relative text-dark-charcoal hover:text-primary transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-primary text-dark-charcoal text-xs font-bold px-2 py-0.5 rounded-full border border-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-dark-charcoal hover:text-primary focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Categories Navigation Bar (with Mega Menu) */}
      <nav className="bg-yellow-50 border-t border-primary hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-8 h-12 relative">
            {mainCategories.map((category) => (
              <div
                key={category.slug}
                className="h-full flex items-center"
                onMouseEnter={() => setActiveCategory(category.slug)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <Link
                  href={`/catalog?category=${category.name}`}
                  className="text-sm font-bold text-dark-charcoal hover:text-primary relative py-3 group flex items-center gap-1"
                >
                  <span>{category.name}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-200"></span>
                </Link>

                {/* Mega Menu Dropdown */}
                {activeCategory === category.slug && (
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl bg-white border-2 border-primary rounded-b-2xl shadow-xl p-6 z-50 grid grid-cols-4 gap-6 transition-all duration-300">
                    <div className="col-span-1 border-r border-yellow-100 pr-4">
                      <h3 className="font-extrabold text-lg text-dark-charcoal mb-2">{category.name}</h3>
                      <p className="text-xs text-gray-500 mb-4">{category.description}</p>
                      <Link
                        href={`/catalog?category=${category.name}`}
                        className="inline-block text-xs font-bold text-dark-charcoal bg-primary px-3 py-1.5 rounded-full hover:bg-primary-hover"
                      >
                        View All
                      </Link>
                    </div>
                    <div className="col-span-3 grid grid-cols-3 gap-y-2 gap-x-4 max-h-64 overflow-y-auto pr-2">
                      {category.items.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/product/${sub.slug}`}
                          className="text-xs text-gray-600 hover:text-primary font-bold hover:underline transition-colors py-1"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-primary py-4 px-4 shadow-lg space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border-2 border-primary rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-dark-charcoal font-medium"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-primary hover:text-primary-hover">
              <Search className="h-5 w-5" />
            </button>
          </form>

          {/* Mobile Links */}
          <div className="flex flex-col gap-3 font-semibold text-dark-charcoal text-sm pt-2">
            {user ? (
              <>
                <Link
                  href="/dashboard?tab=projects"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 hover:bg-yellow-50 rounded-lg"
                >
                  <Briefcase className="h-5 w-5" />
                  <span>My Projects</span>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 hover:bg-yellow-50 rounded-lg"
                >
                  <User className="h-5 w-5" />
                  <span>Dashboard / Account</span>
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 hover:bg-yellow-50 rounded-lg"
              >
                <User className="h-5 w-5" />
                <span>Login / Register</span>
              </Link>
            )}

            <Link
              href="/dashboard?tab=favourites"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 hover:bg-yellow-50 rounded-lg"
            >
              <Heart className="h-5 w-5" />
              <span>Favourites</span>
            </Link>

            {user && (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2 text-red-600 hover:bg-yellow-50 rounded-lg w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            )}
          </div>

          {/* Categories List */}
          <div className="border-t border-yellow-100 pt-4">
            <h3 className="font-extrabold text-sm text-dark-charcoal px-2 mb-2">PRODUCT CATEGORIES</h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-gray-600">
              {mainCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/catalog?category=${category.name}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-yellow-50 hover:text-primary rounded-lg"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
