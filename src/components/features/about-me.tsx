import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import Link from 'next/link';

export function AboutMe() {
  return (
    <section id="about" className="py-16 md:py-24 bg-background">
      <div className="container max-w-screen-lg mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16 text-primary tracking-tight">
          About The Artist
        </h2>
        <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-center">
          <div className="md:col-span-2 flex justify-center md:justify-start">
            <div className="relative w-60 h-60 md:w-72 md:h-72">
              <Image
                src="https://picsum.photos/seed/photographer/400/400"
                alt="Photographer Jane Doe"
                width={288} 
                height={288}
                className="rounded-full object-cover shadow-xl border-4 border-accent/20 aspect-square"
                data-ai-hint="portrait person"
                priority
              />
            </div>
          </div>
          <div className="md:col-span-3">
            <Card className="bg-card border-border shadow-2xl rounded-xl">
              <CardHeader className="p-6">
                <CardTitle className="text-2xl md:text-3xl text-accent font-semibold">Jane Doe</CardTitle>
                <p className="text-sm text-muted-foreground">Professional Photographer</p>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4 text-foreground/90">
                <p className="text-base leading-relaxed">
                  Hello! I'm Jane, a passionate photographer with a keen eye for capturing the beauty in fleeting moments and weaving compelling visual narratives. My photographic journey, ignited years ago, has evolved into a dedicated pursuit of artistic excellence across diverse genres—from the grandeur of landscapes to the intimacy of portraiture.
                </p>
                <p className="text-base leading-relaxed">
                  I believe that each photograph holds the potential to stir emotions and immortalize memories. My mission is to craft images that are not only visually breathtaking but also resonate deeply, telling stories that endure.
                </p>
                <Button asChild variant="outline" size="lg" className="mt-4 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300 ease-in-out transform hover:scale-105 group">
                  <Link href="mailto:jane.doe@example.com">
                    <Mail className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-[360deg]" /> Get in Touch
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
