"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddArticlesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; articles?: any[] } | null>(null);

  const handleAddArticles = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/blog/add-articles", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          articles: data.articles,
        });
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to add articles",
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black py-20 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111] border border-[#222] rounded-2xl p-8 md:p-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Add Sample Blog Articles
          </h1>
          <p className="text-gray-400 mb-8">
            Click the button below to add 6 sample articles with images to your blog. These articles will appear on the public blog page.
          </p>

          <Button
            onClick={handleAddArticles}
            disabled={loading}
            className="bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white text-lg px-8 py-6 mb-6"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Adding Articles...
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2" />
                Add 6 Sample Articles
              </>
            )}
          </Button>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-lg border ${
                result.success
                  ? "bg-green-500/10 border-green-500/50 text-green-400"
                  : "bg-red-500/10 border-red-500/50 text-red-400"
              }`}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold mb-2">{result.message}</p>
                  {result.success && result.articles && (
                    <ul className="text-sm space-y-1 mt-3">
                      {result.articles.map((article, index) => (
                        <li key={index} className="text-gray-300">
                          ✓ {article.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          <div className="mt-8 pt-8 border-t border-[#222]">
            <h2 className="text-xl font-semibold text-white mb-4">Articles Included:</h2>
            <ul className="space-y-2 text-gray-300">
              <li>• The Ultimate Macro Counting Guide for 2024</li>
              <li>• Meal Prep Sunday: Your Secret Weapon for Success</li>
              <li>• Protein Power: Building Muscle on a Macro-Based Diet</li>
              <li>• Carb Cycling Explained: When and How to Use It</li>
              <li>• Healthy Fats: Your Guide to Essential Fatty Acids</li>
              <li>• Macro Tracking for Beginners: Start Your Journey</li>
            </ul>
            <p className="text-sm text-gray-500 mt-4">
              All articles include high-quality images from Unsplash and full content.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

