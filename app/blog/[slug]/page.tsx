import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// This would typically come from Firebase
const blogPosts: Record<string, { title: string; content: string; date: string }> = {
  "getting-started-with-macros": {
    title: "Getting Started with Macros",
    date: "2024-01-15",
    content: `
      <p>Macronutrients, or macros, are the three main nutrients your body needs in large amounts: protein, carbohydrates, and fats.</p>
      <p>Understanding macros is key to achieving your nutrition goals, whether you want to lose weight, gain muscle, or maintain your current physique.</p>
      <h2>Why Track Macros?</h2>
      <p>Tracking macros gives you flexibility in your diet while ensuring you meet your nutritional needs. Unlike calorie counting alone, macro tracking helps you understand the quality of your food choices.</p>
    `,
  },
  "meal-prep-tips": {
    title: "5 Meal Prep Tips for Success",
    date: "2024-01-10",
    content: `
      <p>Meal prep is one of the most effective strategies for sticking to your nutrition plan. Here are five tips to make it work for you:</p>
      <ol>
        <li>Start small - prep just a few meals at first</li>
        <li>Invest in quality containers</li>
        <li>Prep on the same day each week</li>
        <li>Keep it simple - don't overcomplicate recipes</li>
        <li>Prep ingredients, not just complete meals</li>
      </ol>
    `,
  },
  "protein-sources": {
    title: "Best Plant-Based Protein Sources",
    date: "2024-01-05",
    content: `
      <p>Plant-based proteins are an excellent choice for anyone looking to diversify their protein sources. Here are some of the best options:</p>
      <ul>
        <li>Lentils - 18g protein per cup</li>
        <li>Chickpeas - 15g protein per cup</li>
        <li>Quinoa - 8g protein per cup</li>
        <li>Tofu - 20g protein per cup</li>
        <li>Edamame - 17g protein per cup</li>
      </ul>
    `,
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = blogPosts[params.slug];
  if (!post) {
    return { title: "Post Not Found" };
  }
  return {
    title: `${post.title} - MacroMinded Blog`,
    description: post.content.substring(0, 160),
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts[params.slug];

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Link href="/blog">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        <article>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
          <p className="text-muted-foreground mb-8">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </div>
  );
}

