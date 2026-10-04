import { Header } from '@/components/nisar/header';
import { Hero } from '@/components/nisar/hero';
import { Observatory } from '@/components/nisar/observatory';
import { InSarScience } from '@/components/nisar/insar-science';
import { MissionFacts } from '@/components/nisar/mission-facts';
import { DataAccess } from '@/components/nisar/data-access';
import { Footer } from '@/components/nisar/footer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Observatory />
        <InSarScience />
        <MissionFacts />
        <DataAccess />
      </main>
      <Footer />
    </div>
  );
}
