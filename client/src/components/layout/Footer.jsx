import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Instagram, Heart } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';

const Footer = () => {
  const links = {
    Product: [
      { label: 'Explore', href: '/explore' },
      { label: 'Create Design', href: '/choose' },
      { label: 'Pricing', href: '/#pricing' },
    ],
    Company: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  };

  return (
    <footer className="relative border-t border-glass-border mt-24">
      {/* Glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(199, 109, 74, 0.4), transparent)' }} />

      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="mb-4">
              <BrandLogo size="md" />
            </div>
            <p className="text-dark-400 text-sm leading-relaxed mb-6">
              Design. Customize. Share. The premier creator marketplace where ideas turn into reality.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
                { Icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
                { Icon: Github, href: 'https://github.com', label: 'GitHub' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="toolbar-btn"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold text-white mb-4">{section}</h4>
              <ul className="space-y-3">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-sm text-dark-400 hover:text-white transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-glass-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
            <p className="text-sm text-dark-500">
              © 2025 Crexza. All rights reserved.
            </p>
          </div>
          <p className="text-sm text-dark-500 flex items-center gap-1.5">
            Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> by the Crexza team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
