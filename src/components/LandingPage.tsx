import { useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import {
  School,
  GraduationCap,
  Bot,
  MessageCircle,
  Users,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  BookOpen,
  Building,
} from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

function FadeInSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center justify-between px-6 md:px-12 border-b border-[#E7E7E4] bg-[#F7F7F5]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
            <School className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-black text-sm md:text-base">Ashram Shala Pathraj</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onLogin}
            className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
          >
            Login
          </button>
          <button
            type="button"
            onClick={onRegister}
            className="hidden sm:inline-flex rounded-full border border-[#E7E7E4] bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-[#F3F2EF]"
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-[72px]">
        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute top-24 left-1/4 h-[400px] w-[400px] rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="pointer-events-none absolute top-48 right-1/4 h-[350px] w-[350px] rounded-full bg-amber-100/30 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 py-[140px] md:py-[180px] text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-devanagari text-[clamp(2.5rem,8vw,5.25rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-black"
          >
            शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-6 max-w-xl text-lg md:text-xl text-[#6B6B6B]"
          >
            Nurturing Tribal Youth Through Quality Education
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              type="button"
              onClick={onRegister}
              className="flex items-center gap-2 rounded-full bg-black px-7 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
            >
              Apply for Admission
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onLogin}
              className="flex items-center gap-2 rounded-full border border-[#E7E7E4] bg-white px-7 py-3.5 text-sm font-medium text-black transition-colors hover:bg-[#F3F2EF]"
            >
              Login to Portal
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <FadeInSection className="mx-auto max-w-5xl px-6">
        <div className="rounded-3xl bg-[#F3F2EF] px-8 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '459', label: 'Students' },
              { value: '38', label: 'Staff' },
              { value: '12', label: 'Standards' },
              { value: '520', label: 'Hostel Beds' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-[clamp(2rem,5vw,3rem)] font-semibold text-black leading-none">{stat.value}</p>
                <p className="mt-2 text-sm text-[#6B6B6B]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeInSection>

      {/* Features Section */}
      <section className="mx-auto max-w-5xl px-6 py-[140px] md:py-[180px]">
        <FadeInSection>
          <h2 className="text-center text-3xl md:text-4xl font-semibold text-black tracking-tight">
            Everything you need, in one place
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-[#6B6B6B]">
            Streamlined tools for students, parents, and school administration.
          </p>
        </FadeInSection>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            {
              icon: GraduationCap,
              title: 'Admission Portal',
              description: 'Online admission tracking and management for new students.',
            },
            {
              icon: Bot,
              title: 'AI Assistant',
              description: 'Ask questions about school in Marathi or English, get instant answers.',
            },
            {
              icon: MessageCircle,
              title: 'WhatsApp Bot',
              description: 'Get child updates via WhatsApp messages.',
              badge: 'Coming Soon',
            },
            {
              icon: Users,
              title: 'Parent Portal',
              description: "Track your child's attendance and academic progress online.",
            },
          ].map((feature) => (
            <FadeInSection key={feature.title}>
              <div className="h-full rounded-3xl border border-[#E7E7E4] bg-[#FCFCFB] p-8 transition-shadow hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F2EF]">
                  <feature.icon className="h-6 w-6 text-black" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-black">{feature.title}</h3>
                <p className="mt-2 text-sm text-[#6B6B6B] leading-relaxed">{feature.description}</p>
                {feature.badge && (
                  <span className="mt-3 inline-block rounded-full bg-[#F3F2EF] px-3 py-1 text-xs font-medium text-[#6B6B6B]">
                    {feature.badge}
                  </span>
                )}
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* About Section */}
      <FadeInSection className="mx-auto max-w-5xl px-6 pb-[140px] md:pb-[180px]">
        <div className="rounded-3xl border border-[#E7E7E4] bg-[#FCFCFB] p-8 md:p-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F2EF]">
              <Building className="h-6 w-6 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-black">About Our School</h2>
              <p className="mt-1 text-sm text-[#6B6B6B]">Tribal Development Department, Maharashtra</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4 text-sm text-[#6B6B6B] leading-relaxed">
              <p>
                Established under the Tribal Development Department, Government of Maharashtra, our Ashram Shala provides
                free residential education to tribal students from Standards 1 to 12 (including Higher Secondary - Arts stream).
              </p>
              <p>
                Located in Taluka Karjat, District Raigad, Maharashtra (PIN 410201), we serve tribal communities
                with quality education, hostel facilities, nutritious meals, and holistic development programs.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { icon: BookOpen, text: 'Standards 1st to 12th (Secondary + Higher Secondary Arts)' },
                { icon: Users, text: 'Medium: Marathi | Type: Government Residential' },
                { icon: MapPin, text: 'Tal. Karjat, Dist. Raigad, Maharashtra 410201' },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3 text-sm text-[#6B6B6B]">
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-black" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* Footer */}
      <footer className="border-t border-[#E7E7E4] bg-[#F3F2EF]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            {/* Column 1: School info */}
            <div className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black">
                  <School className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-black text-sm">Ashram Shala</span>
              </div>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                Government residential school nurturing tribal youth through quality education.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">Quick Links</h4>
              <ul className="space-y-2.5 text-sm text-[#6B6B6B]">
                <li><button type="button" onClick={onRegister} className="hover:text-black transition-colors">Admissions</button></li>
                <li><button type="button" onClick={onLogin} className="hover:text-black transition-colors">Portal Login</button></li>
                <li><span>Hostel Info</span></li>
                <li><span>Academics</span></li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">Contact</h4>
              <ul className="space-y-2.5 text-sm text-[#6B6B6B]">
                <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /><span>Pathraj, Karjat, Raigad</span></li>
                <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /><span>02148-XXXXXX</span></li>
                <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /><span>ashramshala@tribal.gov.in</span></li>
              </ul>
            </div>

            {/* Column 4: Department */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">Department</h4>
              <ul className="space-y-2.5 text-sm text-[#6B6B6B]">
                <li>Tribal Development Dept.</li>
                <li>Govt. of Maharashtra</li>
                <li>District Raigad</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#E7E7E4] text-center text-xs text-[#6B6B6B]">
            <p className="font-devanagari">आदिवासी विकास विभाग, महाराष्ट्र शासन &copy; 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
