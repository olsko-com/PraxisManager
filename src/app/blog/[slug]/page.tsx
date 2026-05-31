import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { blogPosts, getBlogPostBySlug } from '@/lib/blog-data';
import { Clock, Calendar, ArrowLeft, ChevronRight, User, Sparkles, BookOpen } from 'lucide-react';
import { Metadata } from 'next';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// Next.js static params generation for lightning fast static exports
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Next.js dynamic metadata generation for page-specific SEO titles/descriptions
export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug);
  if (!post) {
    return {
      title: 'Artikel nicht gefunden | Dáhon Blog',
      description: 'Der gesuchte Blog-Artikel konnte leider nicht gefunden werden.'
    };
  }
  return {
    title: `${post.title} | Dáhon Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author.name],
      images: [
        {
          url: post.coverImage,
          width: 800,
          height: 600,
          alt: post.title
        }
      ]
    }
  };
}

export default async function BlogPostPage({ params }: RouteParams) {
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    return notFound();
  }

  // Find other articles for the recommendation sidebar
  const recommendedPosts = blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  // Schema.org Article Structured Data for rich search snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://dahon.app/blog/${post.slug}`
    },
    "headline": post.title,
    "description": post.excerpt,
    "image": post.coverImage,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Person",
      "name": post.author.name,
      "jobTitle": post.author.role
    },
    "publisher": {
      "@type": "Organization",
      "name": "Dáhon",
      "logo": {
        "@type": "ImageObject",
        "url": "https://images.pexels.com/photos/1484516/pexels-photo-1484516.jpeg"
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#D1DCDB] text-[#003527] flex flex-col selection:bg-emerald-500/20 selection:text-[#003527]">
      {/* Schema.org structured script injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="flex-grow pt-32 pb-24 bg-[#f9f9f8] text-[#191c1c]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          {/* Breadcrumbs & Back Link */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-[#bfc9c3]/30">
            <div className="flex items-center gap-1.5 text-xs text-[#404944] font-semibold select-none">
              <Link href="/blog" className="hover:text-[#003527] transition-colors">Blog</Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#bfc9c3]" />
              <span className="text-[#003527]">{post.category}</span>
            </div>
            <Link 
              href="/blog" 
              className="flex items-center gap-1.5 text-xs font-bold text-[#003527] hover:text-emerald-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Alle Artikel
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* ARTICLE BODY (8 cols) */}
            <article className="lg:col-span-8 space-y-8">
              {/* Category & Title */}
              <div className="space-y-4">
                <span className="inline-flex bg-[#003527]/10 text-[#003527] text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-[#003527]/10 select-none">
                  {post.category}
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-sans text-[#003527] tracking-tight leading-tight">
                  {post.title}
                </h1>
              </div>

              {/* Author & Meta Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-[#f3f4f3] rounded-3xl border border-[#bfc9c3]/30 select-none">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200">
                    <Image src={post.author.avatar} alt={post.author.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#003527] leading-none">{post.author.name}</span>
                    <span className="text-[10px] text-zinc-400 font-semibold mt-1">{post.author.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-5 text-[10px] font-bold text-[#404944] uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(post.date).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
                </div>
              </div>

              {/* Cover Image */}
              <div className="relative h-64 sm:h-[400px] w-full bg-zinc-150 rounded-[2rem] overflow-hidden border border-[#bfc9c3]/30">
                <Image 
                  src={post.coverImage} 
                  alt={post.title} 
                  fill 
                  priority
                  sizes="(max-w-1024px) 100vw, 66vw"
                  className="object-cover" 
                />
              </div>

              {/* Main Prose Content */}
              <div 
                className="prose prose-emerald max-w-none text-zinc-800 leading-relaxed font-serif text-base sm:text-lg space-y-6 pt-4"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>

            {/* SIDEBAR (4 cols) */}
            <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-32 select-none">
              {/* Marketing Call to Action Card */}
              <div className="bg-[#003527] text-white p-8 rounded-[2rem] flex flex-col justify-between border border-[#003527] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 bg-white/10 rounded-bl-2xl">
                  <Sparkles className="h-5 w-5 text-emerald-300 animate-pulse" />
                </div>
                <div className="space-y-4">
                  <span className="text-[9px] font-black text-emerald-300 uppercase tracking-widest bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">Dáhon Premium</span>
                  <h3 className="text-xl font-bold font-sans tracking-tight leading-tight">
                    Bereit für deine digitale Speisekarte?
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    Erstelle dein Menü in Sekunden. Absolut kostenlos starten – jederzeit erweiterbar.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/onboarding"
                      className="inline-flex w-full items-center justify-center bg-white hover:bg-zinc-100 text-[#003527] py-3.5 rounded-full font-bold text-sm transition-all duration-300 active:scale-98"
                    >
                      Jetzt kostenlos starten
                    </Link>
                  </div>
                </div>
              </div>

              {/* Recommended Articles Sidebar */}
              <div className="bg-[#f3f4f3] border border-[#bfc9c3]/30 p-6 rounded-[2rem] space-y-6">
                <h4 className="text-xs font-bold text-[#003527] uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-700" /> Weitere Empfehlungen
                </h4>
                
                <div className="space-y-5">
                  {recommendedPosts.map((recPost) => (
                    <div key={recPost.slug} className="group space-y-2">
                      <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider">{recPost.category}</span>
                      <h5 className="font-bold text-xs text-[#003527] group-hover:text-emerald-800 transition-colors leading-snug">
                        <Link href={`/blog/${recPost.slug}`}>
                          {recPost.title}
                        </Link>
                      </h5>
                      <p className="text-[11px] text-[#404944] leading-relaxed line-clamp-2">
                        {recPost.excerpt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
