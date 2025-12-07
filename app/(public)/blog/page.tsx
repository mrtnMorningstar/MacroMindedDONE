"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Calendar, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { MotionWrapper } from "@/components/motion-wrapper";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail?: string;
  content?: string;
  date: string;
  category?: string;
  author?: string;
  published?: boolean;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsRef = collection(db, "blog");
        const q = query(postsRef, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        
        const postsData: BlogPost[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Only show published posts
          if (data.published !== false) {
            postsData.push({
              id: doc.id,
              slug: data.slug || doc.id,
              title: data.title || "Untitled",
              description: data.description || "",
              thumbnail: data.thumbnail || "",
              content: data.content || "",
              date: data.date || new Date().toISOString(),
              category: data.category || "general",
              author: data.author || "MacroMinded Team",
              published: data.published !== false,
            });
          }
        });
        
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
        // Set empty array on error to show proper empty state
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>(["all"]);
    posts.forEach((post) => {
      if (post.category) {
        cats.add(post.category);
      }
    });
    return Array.from(cats);
  }, [posts]);

  // Filter and search posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.content && post.content.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory =
        selectedCategory === "all" || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2E2E] mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading articles...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-black py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            MacroMinded Blog
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Nutrition tips, recipes, and expert advice to help you achieve your goals
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="blog-search"
              name="blog-search"
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-[#111] border-[#222] text-white placeholder:text-gray-500 focus:border-[#FF2E2E] focus:ring-[#FF2E2E]"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-[#FF2E2E] text-white"
                    : "bg-[#111] text-gray-300 hover:bg-[#222] hover:text-white"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <p className="text-gray-400 text-sm">
            {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"} found
          </p>
        </motion.div>

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            {posts.length === 0 ? (
              <>
                <p className="text-2xl text-gray-400 mb-2">No articles yet</p>
                <p className="text-gray-500 mb-6">
                  Blog posts will appear here once they&apos;re added to the database.
                </p>
                <p className="text-sm text-gray-600">
                  To add blog posts, use the Firebase Console or the admin panel.
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl text-gray-400 mb-2">No articles found</p>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </>
            )}
          </motion.div>
        ) : (
          <MotionWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  layout
                >
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="h-full bg-[#111] border-[#222] hover:border-[#FF2E2E] transition-all duration-300 cursor-pointer group overflow-hidden">
                      {/* Thumbnail */}
                      {post.thumbnail ? (
                        <div className="relative h-48 overflow-hidden bg-[#000] group/image">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                          <Image
                            src={post.thumbnail}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-[#FF2E2E]/30 via-[#FF2E2E]/10 to-[#000] flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-[#FF2E2E]/50" />
                        </div>
                      )}

                      <CardHeader>
                        {post.category && (
                          <span className="text-xs font-semibold text-[#FF2E2E] uppercase tracking-wide mb-2">
                            {post.category}
                          </span>
                        )}
                        <CardTitle className="text-2xl font-bold text-white group-hover:text-[#FF2E2E] transition-colors leading-tight">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <CardDescription className="text-gray-300 text-base leading-relaxed line-clamp-3">
                          {post.description}
                        </CardDescription>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(post.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="pt-2">
                          <span className="text-[#FF2E2E] font-semibold group-hover:underline">
                            Read more →
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </MotionWrapper>
        )}
      </div>
    </div>
  );
}
