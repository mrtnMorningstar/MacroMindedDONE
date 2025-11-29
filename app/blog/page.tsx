import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export const metadata: Metadata = {
  title: "Blog - MacroMinded",
  description: "Nutrition tips, recipes, and expert advice",
};

// This would typically come from Firebase
const blogPosts = [
  {
    id: "1",
    slug: "getting-started-with-macros",
    title: "Getting Started with Macros",
    description: "Learn the basics of macronutrients and how to track them effectively.",
    image: "/blog/macros.jpg",
    date: "2024-01-15",
  },
  {
    id: "2",
    slug: "meal-prep-tips",
    title: "5 Meal Prep Tips for Success",
    description: "Simple strategies to make meal prep easier and more sustainable.",
    image: "/blog/meal-prep.jpg",
    date: "2024-01-10",
  },
  {
    id: "3",
    slug: "protein-sources",
    title: "Best Plant-Based Protein Sources",
    description: "Discover high-quality plant proteins for your meal plan.",
    image: "/blog/protein.jpg",
    date: "2024-01-05",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nutrition tips, recipes, and expert advice to help you on your journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>{post.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {new Date(post.date).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

