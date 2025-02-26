import ModernHero from '@/components/ModernHero'
import { FloatingNav } from '@/components/floating-nav'
import { PageProgress } from '@/components/page-progress'
import { About } from '@/components/sections/about'
import { Experience } from '@/components/sections/experience'
import Projects from '@/components/sections/projects'
import { Certifications } from '@/components/sections/certifications'
import { Contact } from '@/components/sections/contact'
import { ScrollToTop } from '@/components/ScrollToTop'
import { CompanyBanner } from '@/components/CompanyBanner'

export default function Home() {
  return (  
    <main>
      <ScrollToTop />
      <PageProgress />
      <FloatingNav />
      <section id="hero">
        <ModernHero />
      </section>
      <About />
      <Experience />
      <div className="bg-gray-100 dark:bg-[#0a0a0a] py-12">
        <CompanyBanner />
      </div>
      <Projects />
      <Certifications />
      <Contact />
    </main>
  )
}
