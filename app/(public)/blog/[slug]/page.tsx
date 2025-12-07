"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Image as ImageIcon } from "lucide-react";
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
        // Try to find post by slug
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
          // Fallback: try to get by document ID
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
      <div className="bg-black py-20 flex items-center justify-center">
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
      <div className="bg-black py-20 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a0a0a] to-[#0a0a0a] py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF2E2E' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link href="/blog">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-[#111]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </motion.div>

        {/* Article */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#111]/80 backdrop-blur-sm border border-[#222]/50 rounded-2xl p-8 md:p-12 shadow-2xl"
        >
          {/* Thumbnail */}
          {post.thumbnail && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8 rounded-2xl overflow-hidden relative w-full h-[500px] shadow-2xl border-2 border-[#FF2E2E]/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF2E2E]/20 via-transparent to-[#7b0000]/20 z-10" />
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                className="object-cover"
                loading="eager"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </motion.div>
          )}

          {/* Category Badge */}
          {post.category && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-4"
            >
              <span className="inline-block px-6 py-3 bg-gradient-to-r from-[#FF2E2E] to-[#CC0000] text-white text-sm font-bold uppercase tracking-wide rounded-full shadow-lg shadow-[#FF2E2E]/30">
                {post.category}
              </span>
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent mb-6 leading-tight"
          >
            {post.title}
          </motion.h1>

          {/* Meta Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-6 mb-8 text-gray-400"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span className="text-lg">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="text-lg">{post.author}</span>
            </div>
          </motion.div>

          {/* Description */}
          {post.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed px-4 py-4 bg-gradient-to-r from-[#FF2E2E]/10 via-transparent to-[#FF2E2E]/10 rounded-lg border-l-4 border-[#FF2E2E]"
            >
              {post.description}
            </motion.p>
          )}

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="prose prose-invert prose-lg max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:text-[#FF2E2E]
              prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-6 prose-h2:text-[#FF2E2E]
              prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-4 prose-h3:text-[#FF5555]
              prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-3 prose-h4:text-[#FF7777]
              prose-p:text-gray-100 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-[#FF2E2E] prose-a:no-underline prose-a:font-semibold hover:prose-a:underline hover:prose-a:text-[#FF5555]
              prose-strong:text-white prose-strong:font-bold
              prose-ul:text-gray-100 prose-ul:text-lg prose-ul:my-4
              prose-ol:text-gray-100 prose-ol:text-lg prose-ol:my-4
              prose-li:my-2 prose-li:text-gray-100
              prose-blockquote:border-l-4 prose-blockquote:border-[#FF2E2E] prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-4 prose-blockquote:italic prose-blockquote:text-gray-200 prose-blockquote:bg-[#FF2E2E]/5 prose-blockquote:rounded-r-lg
              prose-code:text-[#FF2E2E] prose-code:bg-[#1a1a1a] prose-code:px-3 prose-code:py-1 prose-code:rounded prose-code:border prose-code:border-[#FF2E2E]/20
              prose-img:rounded-xl prose-img:my-8 prose-img:shadow-2xl prose-img:border-2 prose-img:border-[#FF2E2E]/20"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </motion.article>

        {/* Back to Blog CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 pt-8 border-t border-[#222]"
        >
          <Link href="/blog">
            <Button className="bg-[#FF2E2E] hover:bg-[#CC0000] text-white text-lg px-8 py-6">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to All Articles
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
