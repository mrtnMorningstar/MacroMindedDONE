"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Clock, Share2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  thumbnail?: string;
  date: string;
  category?: string;
  author?: string;
  published?: boolean;
}

// Topic-specific images from Unsplash - matching the blog listing page
const TOPIC_IMAGES: Record<string, string[]> = {
  nutrition: [
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&h=800&fit=crop&q=80", // Food scale macro tracking
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=800&fit=crop&q=80", // Fresh vegetables produce
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&h=800&fit=crop&q=80", // Colorful healthy fruits
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=800&fit=crop&q=80", // Fresh healthy foods
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=800&fit=crop&q=80", // Healthy food variety
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=800&fit=crop&q=80", // Healthy balanced meal
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=800&fit=crop&q=80", // Fresh healthy ingredients
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&q=80", // Balanced nutrition meal
    "https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?w=1200&h=800&fit=crop&q=80", // Nutrition tracking
  ],
  fitness: [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop&q=80", // Gym workout
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&h=800&fit=crop&q=80", // Weightlifting
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=800&fit=crop&q=80", // Strength training
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&h=800&fit=crop&q=80", // Fitness equipment
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=800&fit=crop&q=80", // Crossfit
    "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=1200&h=800&fit=crop&q=80", // Running
  ],
  "meal-planning": [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&q=80", // Organized meal prep containers
    "https://images.unsplash.com/photo-1476718406336-bb5c969678a0?w=1200&h=800&fit=crop&q=80", // Meal prep containers with food
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&h=800&fit=crop&q=80", // Kitchen meal prep setup
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&h=800&fit=crop&q=80", // Meal prep containers organized
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&h=800&fit=crop&q=80", // Meal prep ingredients
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=800&fit=crop&q=80", // Meal planning board
  ],
  recipes: [
    "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=1200&h=800&fit=crop&q=80", // Beautiful plated breakfast
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=800&fit=crop&q=80", // Delicious prepared meal
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&h=800&fit=crop&q=80", // Appetizing food presentation
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1200&h=800&fit=crop&q=80", // Professional food styling
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=800&fit=crop&q=80", // Fresh cooking ingredients
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=800&fit=crop&q=80", // Cooking preparation
  ],
  default: [
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&h=800&fit=crop&q=80", // Colorful healthy fruits
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=800&fit=crop&q=80", // Balanced healthy meal
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=800&fit=crop&q=80", // Healthy food variety
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=800&fit=crop&q=80", // Fresh healthy foods
  ],
};

const getImageForPost = (post: BlogPost): string | null => {
  if (post.thumbnail && post.thumbnail.trim() !== "") {
    return post.thumbnail;
  }

  // Determine topic from category (prioritize category over title)
  const category = (post.category || "").toLowerCase();
  const title = (post.title || "").toLowerCase();
  
  let topic = "default";
  
  // Prioritize category matching
  if (category === "nutrition") {
    topic = "nutrition";
  } else if (category === "fitness") {
    topic = "fitness";
  } else if (category === "meal-planning" || category === "meal planning") {
    topic = "meal-planning";
  } else if (category === "recipes" || category === "recipe") {
    topic = "recipes";
  } else {
    // Fallback to title keywords if category not set
    if (title.includes("fat") || title.includes("protein") || title.includes("carb") || title.includes("macro") || title.includes("nutrition")) {
      topic = "nutrition";
    } else if (title.includes("workout") || title.includes("exercise") || title.includes("training") || title.includes("strength") || title.includes("bulk")) {
      topic = "fitness";
    } else if (title.includes("meal") && (title.includes("prep") || title.includes("plan"))) {
      topic = "meal-planning";
    } else if (title.includes("recipe") || title.includes("breakfast") || title.includes("cook")) {
      topic = "recipes";
    }
  }
  
  const images = TOPIC_IMAGES[topic] || TOPIC_IMAGES.default;
  // Use slug hash for consistent but varied image selection
  const hash = post.slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % images.length;
  return images[index] || images[0];
};

// Calculate reading time
const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, ""); // Remove HTML tags
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postsRef = collection(db, "blog");
        const q = query(postsRef, where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          setPost({
            id: doc.id,
            slug: data.slug || doc.id,
            title: data.title || "Untitled",
            description: data.description || "",
            content: data.content || "",
            thumbnail: data.thumbnail || "",
            date: data.date || new Date().toISOString(),
            category: data.category || "general",
            author: data.author || "MacroMinded Team",
            published: data.published !== false,
          });
        } else {
          const docRef = doc(db, "blog", slug);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPost({
              id: docSnap.id,
              slug: data.slug || docSnap.id,
              title: data.title || "Untitled",
              description: data.description || "",
              content: data.content || "",
              thumbnail: data.thumbnail || "",
              date: data.date || new Date().toISOString(),
              category: data.category || "general",
              author: data.author || "MacroMinded Team",
              published: data.published !== false,
            });
          } else {
            setNotFound(true);
          }
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-black py-20 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2E2E] mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading article...</p>
        </motion.div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="bg-black py-20 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Article Not Found</h1>
          <p className="text-gray-400 mb-8">The article you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/blog">
            <Button className="bg-[#FF2E2E] hover:bg-[#CC0000] text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const imageUrl = getImageForPost(post);
  const readingTime = calculateReadingTime(post.content);
  const hasValidImage = imageUrl && imageUrl.trim() !== "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a]">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #FF2E2E 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Hero Section with Image */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black z-10" />
        {hasValidImage && (
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized
          />
        )}
        
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute top-6 left-4 md:left-8 z-20"
        >
          <Link href="/blog">
            <Button
              variant="ghost"
              className="bg-black/50 backdrop-blur-md text-white hover:bg-black/70 border border-white/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </motion.div>

        {/* Content Overlay */}
        <div className="absolute inset-0 z-10 flex items-end">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl pb-12 md:pb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {post.category && (
                <span className="inline-block px-4 py-2 bg-[#FF2E2E] text-white text-sm font-bold uppercase tracking-wide rounded-full mb-4 shadow-lg">
                  {post.category}
                </span>
              )}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight drop-shadow-2xl">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} min read</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-12 md:py-16">
        {/* Description/Excerpt - Harvard Style */}
        {post.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed italic font-normal">
              {post.description}
            </p>
          </motion.div>
        )}

        {/* Divider */}
        <div className="border-t border-[#222] my-8"></div>

        {/* Main Content - Clean Harvard Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-transparent"
        >
          <style dangerouslySetInnerHTML={{ __html: `
            .blog-content {
              color: #e5e5e5;
            }
            .blog-content p {
              margin-bottom: 1.5rem;
              line-height: 1.75;
              font-size: 1.0625rem;
            }
            .blog-content p:first-of-type {
              font-size: 1.125rem;
              margin-bottom: 2rem;
            }
            .blog-content h2 {
              margin-top: 2.5rem;
              margin-bottom: 1.25rem;
              font-weight: 700;
              font-size: 1.875rem;
              line-height: 1.3;
            }
            .blog-content h3 {
              margin-top: 2rem;
              margin-bottom: 1rem;
              font-weight: 600;
              font-size: 1.5rem;
              line-height: 1.4;
            }
            .blog-content h4 {
              margin-top: 1.5rem;
              margin-bottom: 0.75rem;
              font-weight: 600;
              font-size: 1.25rem;
            }
            .blog-content ul,
            .blog-content ol {
              margin-top: 1rem;
              margin-bottom: 1.5rem;
              padding-left: 1.5rem;
            }
            .blog-content ul li,
            .blog-content ol li {
              margin-bottom: 0.75rem;
              line-height: 1.7;
            }
            .blog-content ul li {
              list-style-type: disc;
            }
            .blog-content ol li {
              list-style-type: decimal;
            }
            .blog-content strong {
              font-weight: 700;
            }
            .blog-content blockquote {
              margin: 2rem 0;
              padding-left: 1.5rem;
              border-left: 3px solid rgba(255, 46, 46, 0.4);
              font-style: italic;
            }
            .blog-content a {
              color: #FF2E2E;
              text-decoration: underline;
            }
            .blog-content a:hover {
              color: #FF5555;
            }
          `}}></style>
          <div 
            className={`blog-content prose prose-invert prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-white
              prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-0 prose-h1:font-bold
              prose-h2:text-3xl prose-h2:text-white prose-h2:font-bold
              prose-h3:text-2xl prose-h3:text-white prose-h3:font-semibold
              prose-h4:text-xl prose-h4:text-white prose-h4:font-semibold
              prose-p:text-gray-200 prose-p:font-normal
              prose-strong:text-white prose-strong:font-bold
              prose-a:text-[#FF2E2E] prose-a:underline prose-a:font-normal
              prose-ul:text-gray-200 prose-ul:font-normal
              prose-ol:text-gray-200 prose-ol:font-normal
              prose-li:text-gray-200 prose-li:font-normal
              prose-blockquote:text-gray-300 prose-blockquote:font-normal
              prose-code:text-[#FF2E2E] prose-code:bg-[#1a1a1a] prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
              prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-[#222] prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
              prose-img:rounded-lg prose-img:my-8 prose-img:shadow-lg prose-img:border prose-img:border-[#222] 
                prose-img:w-full prose-img:h-auto
              prose-hr:border-[#222] prose-hr:my-8
              prose-table:text-gray-200 prose-table:border-collapse prose-table:w-full
              prose-th:border prose-th:border-[#222] prose-th:bg-[#1a1a1a] prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-bold prose-th:text-white
              prose-td:border prose-td:border-[#222] prose-td:px-4 prose-td:py-2 prose-td:bg-[#111]/50`}
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          />
        </motion.div>

        {/* Share Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 pt-8 border-t border-[#222]"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-gray-400">
              <Share2 className="h-5 w-5" />
              <span className="text-sm">Share this article</span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-[#222] text-gray-300 hover:bg-[#111] hover:text-white"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: post.title,
                      text: post.description,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Link href="/blog">
                <Button className="bg-[#FF2E2E] hover:bg-[#CC0000] text-white">
                  <BookOpen className="h-4 w-4 mr-2" />
                  More Articles
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </article>
    </div>
  );
}
