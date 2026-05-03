'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, Trophy } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#como-funciona', label: 'Como Funciona' },
    { href: '/agenda', label: 'Ver Horários' },
  ];

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled ? 'glass shadow-lg py-3' : 'py-5 bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <motion.a
          href="/"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className={cn('font-black text-lg leading-none tracking-tight', isScrolled ? 'text-slate-900 dark:text-white' : 'text-white')}>
              Arena Chapadão
            </div>
            <div className="text-[10px] font-bold tracking-widest" style={{ color: '#f97316' }}>AGUDOS</div>
          </div>
        </motion.a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary-400',
                isScrolled ? 'text-slate-600 dark:text-slate-300' : 'text-white/80'
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isScrolled ? 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800' : 'text-white/80 hover:bg-white/10'
              )}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
          <Button
            size="sm"
            onClick={() => window.location.href = '/admin/login'}
            className="hidden md:flex font-bold"
            variant="outline"
          >
            Admin
          </Button>
          <Button
            size="sm"
            onClick={() => window.location.href = '/agenda'}
            className="hidden md:flex text-white font-bold"
            style={{ background: 'linear-gradient(135deg, #ea6c0d, #f97316)' }}
          >
            Reservar Agora
          </Button>
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Button fullWidth variant="outline" onClick={() => window.location.href = '/admin/login'}>
                Admin
              </Button>
              <Button fullWidth onClick={() => window.location.href = '/agenda'}
                style={{ background: 'linear-gradient(135deg, #ea6c0d, #f97316)' }}>
                Reservar Agora
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
