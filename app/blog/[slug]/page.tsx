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
      <div className="min-h-screen bg-black py-20 flex items-center justify-center">
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
      <div className="min-h-screen bg-black py-20 flex items-center justify-center">
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
    <div className="min-h-screen bg-black py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
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
        >
          {/* Thumbnail */}
          {post.thumbnail && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8 rounded-lg overflow-hidden relative w-full h-96"
            >
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                className="object-cover"
                loading="eager"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
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
              <span className="inline-block px-4 py-2 bg-[#FF2E2E] text-white text-sm font-semibold uppercase tracking-wide rounded-lg">
                {post.category}
              </span>
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
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
              className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed"
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
              prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8
              prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-6
              prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-4
              prose-p:text-gray-200 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-[#FF2E2E] prose-a:no-underline prose-a:font-semibold hover:prose-a:underline
              prose-strong:text-white prose-strong:font-bold
              prose-ul:text-gray-200 prose-ul:text-lg prose-ul:my-4
              prose-ol:text-gray-200 prose-ol:text-lg prose-ol:my-4
              prose-li:my-2
              prose-blockquote:border-l-4 prose-blockquote:border-[#FF2E2E] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-300
              prose-code:text-[#FF2E2E] prose-code:bg-[#111] prose-code:px-2 prose-code:py-1 prose-code:rounded
              prose-img:rounded-lg prose-img:my-8"
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
