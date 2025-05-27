"use client"

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Github, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Zap, 
  Lock, 
  Globe,
  Clock 
} from 'lucide-react';

import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { SignInButton } from '@/components/auth/sign-in-button';
import { Card, CardContent } from '@/components/ui/card';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { SiteHeader } from '@/components/site-header-index';

const features = [
  {
    title: "Next.js 14",
    description: "Built with the latest version of Next.js and React Server Components",
    icon: Zap,
  },
  {
    title: "Authentication",
    description: "Secure authentication using Auth.js with multiple providers",
    icon: Lock,
  },
  {
    title: "TypeScript",
    description: "Written in TypeScript for better development experience",
    icon: Globe,
  },
  {
    title: "Shadcn UI",
    description: "Beautiful and accessible components using Shadcn UI",
    icon: Star,
  }
];

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState("2025-04-05 07:46:00");
  const username = "Devambience";

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toISOString().replace('T', ' ').split('.')[0];
      setCurrentTime(formattedTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader username={username} />
      
      <main className="flex-1">
        {/* Current Time Display */}
        <div className="fixed top-20 right-4 z-50 bg-background/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>{currentTime} UTC</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          <BackgroundBeams />
          <div className="container relative z-10 mx-auto px-4">
            <div className="text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-primary transition-colors hover:bg-primary/20"
                >
                  <ShieldCheck className="h-5 w-5" />
                  <span className="font-medium">Welcome, {username}</span>
                </Link>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="font-bold tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              >
                Modern Way of Learning
                <br />
                <span className="text-primary">Made Simple</span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="space-x-4"
              >
                <SignInButton mode="redirect" asChild>
                  <Button size="lg" className="h-11 px-8">
                    Get Started 
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </SignInButton>
                <Button variant="outline" size="lg" className="h-11 px-8" asChild>
                  <Link
                    href="https://github.com/Devambience"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container space-y-12 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center"
          >
            <h2 className="font-bold text-4xl leading-[1.1] sm:text-6xl">
              Features
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to build modern authentication systems
            </p>
          </motion.div>

          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
              >
                <Card className="relative overflow-hidden group">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <feature.icon className="h-10 w-10 text-primary transition-transform group-hover:scale-110" />
                      <div className="space-y-1">
                        <h3 className="font-bold text-xl">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-[58rem] rounded-3xl bg-slate-950 p-8 md:p-12 lg:p-16 relative overflow-hidden"
          >
            <div className="relative z-10 mx-auto max-w-[40rem] space-y-6 text-center">
              <h2 className="font-bold text-3xl text-white md:text-4xl">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground text-white/80">
                Join {username} and thousands of other developers building secure applications.
              </p>
              <br></br>
              <SignInButton mode="redirect" asChild>
                <Button size="lg" className="h-11 px-8 bg-white text-slate-950 hover:bg-white/90">
                  Start Building
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInButton>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-purple-500/10 to-background/5" />
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}