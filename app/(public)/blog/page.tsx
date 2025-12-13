"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Calendar, Clock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

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

// Topic-specific images from Unsplash - each category has unique images
const TOPIC_IMAGES: Record<string, string[]> = {
  nutrition: [
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop&q=80", // Food scale macro tracking
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop&q=80", // Fresh vegetables produce
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&h=600&fit=crop&q=80", // Colorful healthy fruits
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop&q=80", // Fresh healthy foods
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop&q=80", // Healthy food variety
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80", // Healthy balanced meal
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&q=80", // Fresh healthy ingredients
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80", // Balanced nutrition meal
    "https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?w=800&h=600&fit=crop&q=80", // Nutrition tracking
  ],
  fitness: [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80", // Gym workout
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&h=600&fit=crop&q=80", // Weightlifting
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&q=80", // Strength training
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop&q=80", // Fitness equipment
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop&q=80", // Crossfit
    "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&h=600&fit=crop&q=80", // Running
  ],
  "meal-planning": [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80", // Organized meal prep containers
    "https://images.unsplash.com/photo-1476718406336-bb5c969678a0?w=800&h=600&fit=crop&q=80", // Meal prep containers with food
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop&q=80", // Kitchen meal prep setup
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop&q=80", // Meal prep containers organized
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&h=600&fit=crop&q=80", // Meal prep ingredients
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop&q=80", // Meal planning board
  ],
  recipes: [
    "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=600&fit=crop&q=80", // Beautiful plated breakfast
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop&q=80", // Delicious prepared meal
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop&q=80", // Appetizing food presentation
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop&q=80", // Professional food styling
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop&q=80", // Fresh cooking ingredients
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&q=80", // Cooking preparation
  ],
  default: [
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&h=600&fit=crop&q=80", // Colorful healthy fruits
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80", // Balanced healthy meal
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop&q=80", // Healthy food variety
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop&q=80", // Fresh healthy foods
  ],
};

// Get topic-specific image based on category - ensures no duplicates and proper category matching
const getImageForPost = (post: BlogPost, allPosts: BlogPost[], currentIndex: number, usedImages: Set<string>): string => {
  // Use custom thumbnail if provided
  if (post.thumbnail && post.thumbnail.trim() !== "") {
    return post.thumbnail;
  }

  // Determine topic from category (prioritize category over title)
  const category = (post.category || "").toLowerCase();
  const title = (post.title || "").toLowerCase();
  
  let topic = "default";
  
  // Prioritize category matching - strict matching
  if (category === "nutrition" || category === "nutrition") {
    topic = "nutrition";
  } else if (category === "fitness") {
    topic = "fitness";
  } else if (category === "meal-planning" || category === "meal planning" || category === "mealplanning") {
    topic = "meal-planning";
  } else if (category === "recipes" || category === "recipe") {
    topic = "recipes";
  } else {
    // Fallback to title keywords if category not set
    if (title.includes("fat") || title.includes("protein") || title.includes("carb") || title.includes("macro") || title.includes("nutrition") || title.includes("weight loss") || title.includes("plateau")) {
      topic = "nutrition";
    } else if (title.includes("workout") || title.includes("exercise") || title.includes("training") || title.includes("strength") || title.includes("bulk") || title.includes("muscle")) {
      topic = "fitness";
    } else if (title.includes("meal") && (title.includes("prep") || title.includes("plan"))) {
      topic = "meal-planning";
    } else if (title.includes("recipe") || title.includes("breakfast") || title.includes("cook")) {
      topic = "recipes";
    }
  }
  
  const images = TOPIC_IMAGES[topic] || TOPIC_IMAGES.default;
  
  // Find an unused image from the appropriate category
  // First, try to find an image not used by any other post
  const availableImages = images.filter(img => !usedImages.has(img));
  
  if (availableImages.length > 0) {
    const selectedImage = availableImages[0];
    usedImages.add(selectedImage);
    return selectedImage;
  }
  
  // If all images in category are used, cycle through them but ensure no immediate duplicates
  // Use a hash of the post slug to get consistent but varied assignment
  const hash = post.slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = (hash + currentIndex) % images.length;
  return images[index];
};

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
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>(["all"]);
    posts.forEach((post) => {
      if (post.category) {
        cats.add(post.category);
      }
    });
    return Array.from(cats);
  }, [posts]);

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
      <div className="py-20 flex items-center justify-center min-h-screen bg-black">
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
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black py-12 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
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
          className="mb-12 space-y-6"
        >
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <Input
              id="blog-search"
              name="blog-search"
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-[#111] border-[#222] text-white placeholder:text-gray-500 focus:border-[#FF2E2E] focus:ring-[#FF2E2E] rounded-xl"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 items-center justify-center">
            <Filter className="h-5 w-5 text-gray-400" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-[#FF2E2E] to-[#CC0000] text-white shadow-lg shadow-[#FF2E2E]/30 scale-105"
                    : "bg-[#111] text-gray-300 hover:bg-[#222] hover:text-white border border-[#222]"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <p className="text-gray-400 text-sm text-center">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {(() => {
                // Track used images to prevent duplicates within this render
                const usedImages = new Set<string>();
                return filteredPosts.map((post, index) => {
                  const imageUrl = getImageForPost(post, filteredPosts, index, usedImages);
                  return (
                    <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
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
                      <Card className="h-full bg-gradient-to-br from-[#111] to-[#0a0a0a] border-[#222] hover:border-[#FF2E2E]/50 transition-all duration-300 cursor-pointer group overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-[#FF2E2E]/10">
                        {/* Thumbnail */}
                        <div className="relative h-64 overflow-hidden bg-[#000]">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
                          {imageUrl && imageUrl.trim() !== "" && (
                            <Image
                              src={imageUrl}
                              alt={post.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                              loading="lazy"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              unoptimized
                            />
                          )}
                          {/* Category Badge Overlay */}
                          {post.category && (
                            <div className="absolute top-4 left-4 z-20">
                              <span className="px-3 py-1.5 bg-[#FF2E2E] text-white text-xs font-bold uppercase tracking-wide rounded-full shadow-lg">
                                {post.category}
                              </span>
                            </div>
                          )}
                        </div>

                        <CardHeader className="p-6">
                          <CardTitle className="text-2xl font-bold text-white group-hover:text-[#FF2E2E] transition-colors leading-tight line-clamp-2">
                            {post.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 space-y-4">
                          <CardDescription className="text-gray-300 text-base leading-relaxed line-clamp-3">
                            {post.description}
                          </CardDescription>
                          <div className="flex items-center gap-4 text-sm text-gray-400 pt-2 border-t border-[#222]">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(post.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              <span>5 min read</span>
                            </div>
                          </div>
                          <div className="pt-2 flex items-center text-[#FF2E2E] font-semibold group-hover:gap-2 transition-all">
                            <span>Read article</span>
                            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              });
            })()}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
