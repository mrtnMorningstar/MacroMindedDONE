"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, FileText, Trash2, Edit } from "lucide-react";
import { collection, onSnapshot, doc, deleteDoc, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/admin/shared/modal";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  category?: string;
  date: string;
  published?: boolean;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingArticles, setAddingArticles] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "blog"), (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as BlogPost),
      }));
      setPosts(postsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddSampleArticles = async () => {
    setAddingArticles(true);
    try {
      // Get existing slugs to avoid duplicates
      const existingSlugs = new Set(posts.map((p) => p.slug));
      
      const sampleArticles = [
        {
          slug: "ultimate-macro-guide-2024",
          title: "The Ultimate Macro Counting Guide for 2024",
          description: "Learn how to master macro counting and transform your nutrition approach. This comprehensive guide covers everything from calculating your macros to meal planning strategies.",
          category: "nutrition",
          author: "MacroMinded Team",
          date: new Date("2024-01-15").toISOString(),
          published: true,
          content: `<h2>What Are Macros?</h2><p>Macronutrients, or "macros" for short, are the three main nutrients your body needs in large amounts: proteins, carbohydrates, and fats. Each plays a crucial role in your health and fitness goals.</p><h3>Protein: The Building Block</h3><p>Protein is essential for muscle repair, growth, and maintenance. Aim for 0.8-1.2 grams per pound of body weight, depending on your activity level and goals.</p><h3>Carbohydrates: Your Energy Source</h3><p>Carbs fuel your workouts and daily activities. Complex carbohydrates like whole grains, sweet potatoes, and quinoa provide sustained energy.</p><h3>Fats: Essential for Health</h3><p>Don't fear fats! Healthy fats from avocados, nuts, and olive oil support hormone production and nutrient absorption.</p><h2>How to Calculate Your Macros</h2><p>Start by determining your Total Daily Energy Expenditure (TDEE), then adjust based on your goals:</p><ul><li><strong>Weight Loss:</strong> 10-20% calorie deficit</li><li><strong>Muscle Gain:</strong> 10-20% calorie surplus</li><li><strong>Maintenance:</strong> Match your TDEE</li></ul><h2>Meal Planning Tips</h2><p>Plan your meals in advance to hit your macro targets consistently. Use our MacroMinded calculator to get personalized recommendations based on your goals, activity level, and preferences.</p><h2>Common Mistakes to Avoid</h2><ul><li>Not tracking accurately (weigh your food!)</li><li>Ignoring micronutrients</li><li>Being too restrictive</li><li>Not adjusting as you progress</li></ul><p>Remember, consistency is key. Track your macros daily and adjust based on your results and how you feel.</p>`,
        },
        {
          slug: "meal-prep-sunday-success",
          title: "Meal Prep Sunday: Your Secret Weapon for Success",
          description: "Discover how dedicating just a few hours on Sunday can set you up for a week of healthy eating and macro success. Learn our proven meal prep strategies.",
          category: "meal-planning",
          author: "MacroMinded Team",
          date: new Date("2024-01-22").toISOString(),
          published: true,
          content: `<h2>Why Meal Prep Works</h2><p>Meal prepping eliminates decision fatigue and ensures you always have macro-friendly meals ready. When healthy food is convenient, you're more likely to stick to your goals.</p><h3>The Sunday Strategy</h3><p>Dedicate 2-3 hours on Sunday to prepare your meals for the week. Here's our proven approach:</p><h3>Step 1: Plan Your Menu</h3><p>Choose 2-3 protein sources, 2-3 carb sources, and plenty of vegetables. Mix and match throughout the week to avoid boredom.</p><h3>Step 2: Batch Cook</h3><ul><li>Cook proteins in bulk (chicken, ground turkey, fish)</li><li>Roast vegetables on sheet pans</li><li>Prepare grains and starches</li><li>Portion into containers</li></ul><h3>Step 3: Store Properly</h3><p>Use airtight containers and label with dates. Most prepped meals stay fresh for 4-5 days in the refrigerator.</p><h2>Meal Prep Essentials</h2><ul><li>Quality food storage containers</li><li>Food scale for accurate portions</li><li>Sheet pans and baking dishes</li><li>Slow cooker or Instant Pot</li></ul><h2>Time-Saving Tips</h2><p>Prep ingredients, not just complete meals. Pre-cut vegetables, marinated proteins, and pre-portioned snacks can save time during the week.</p><p>Start small with 2-3 days of prep, then gradually increase as you get comfortable with the process.</p>`,
        },
        {
          slug: "protein-power-building-muscle",
          title: "Protein Power: Building Muscle on a Macro-Based Diet",
          description: "Unlock the secrets of optimal protein intake for muscle growth. Learn when to eat protein, how much you need, and the best sources for your goals.",
          category: "fitness",
          author: "MacroMinded Team",
          date: new Date("2024-02-01").toISOString(),
          published: true,
          content: `<h2>The Role of Protein in Muscle Building</h2><p>Protein provides the amino acids your muscles need to repair and grow after workouts. Without adequate protein, your body can't build new muscle tissue effectively.</p><h3>How Much Protein Do You Need?</h3><p>For muscle building, aim for 1.0-1.2 grams of protein per pound of body weight. If you weigh 150 pounds, that's 150-180 grams daily.</p><h3>Best Protein Sources</h3><ul><li><strong>Lean Meats:</strong> Chicken breast, turkey, lean beef</li><li><strong>Fish:</strong> Salmon, tuna, cod</li><li><strong>Eggs:</strong> Whole eggs provide complete protein</li><li><strong>Dairy:</strong> Greek yogurt, cottage cheese, whey protein</li><li><strong>Plant-Based:</strong> Lentils, chickpeas, tofu, tempeh</li></ul><h2>Protein Timing</h2><p>While total daily protein matters most, spreading it throughout the day (every 3-4 hours) can optimize muscle protein synthesis.</p><h3>Post-Workout Protein</h3><p>Consume 20-40 grams of protein within 2 hours of your workout to maximize recovery and muscle growth.</p><h2>Protein Quality Matters</h2><p>Complete proteins contain all essential amino acids. Animal sources are typically complete, while plant sources may need to be combined (like rice and beans).</p><h2>Common Protein Mistakes</h2><ul><li>Not eating enough protein</li><li>Relying too heavily on protein shakes</li><li>Ignoring protein in vegetables</li><li>Not adjusting intake as you gain muscle</li></ul><p>Remember, protein is just one piece of the puzzle. Combine it with proper training, adequate carbs for energy, and sufficient rest for optimal results.</p>`,
        },
        {
          slug: "carb-cycling-explained",
          title: "Carb Cycling Explained: When and How to Use It",
          description: "Learn about carb cycling, a strategic approach to carbohydrate intake that can help you break through plateaus and optimize your body composition.",
          category: "nutrition",
          author: "MacroMinded Team",
          date: new Date("2024-02-10").toISOString(),
          published: true,
          content: `<h2>What is Carb Cycling?</h2><p>Carb cycling involves alternating between high-carb and low-carb days based on your activity level and goals. It's a strategic approach to managing your carbohydrate intake.</p><h3>High-Carb Days</h3><p>On training days, especially heavy lifting or intense cardio days, increase your carbs to fuel performance and recovery. This might mean 200-300+ grams depending on your size and activity.</p><h3>Low-Carb Days</h3><p>On rest days or light activity days, reduce carbs to 50-100 grams. This helps your body become more efficient at using fat for fuel.</p><h2>Who Should Carb Cycle?</h2><ul><li>Athletes with varying training intensities</li><li>Those looking to break through plateaus</li><li>People who want more flexibility in their diet</li><li>Advanced macro trackers</li></ul><h2>Sample Carb Cycling Schedule</h2><p><strong>Monday (Heavy Legs):</strong> High carb (250g)</p><p><strong>Tuesday (Rest):</strong> Low carb (75g)</p><p><strong>Wednesday (Upper Body):</strong> High carb (250g)</p><p><strong>Thursday (Cardio):</strong> Moderate carb (150g)</p><p><strong>Friday (Full Body):</strong> High carb (250g)</p><p><strong>Weekend:</strong> Low to moderate carb</p><h2>Benefits of Carb Cycling</h2><ul><li>Better workout performance on high days</li><li>Improved insulin sensitivity</li><li>More dietary flexibility</li><li>Can help with fat loss while maintaining muscle</li></ul><h2>Getting Started</h2><p>Start with a simple 3-day cycle: high, low, moderate. Track your energy, performance, and results. Adjust based on how you feel and your progress.</p><p>Remember, carb cycling is advanced. Master basic macro tracking first before adding this complexity.</p>`,
        },
        {
          slug: "healthy-fats-guide",
          title: "Healthy Fats: Your Guide to Essential Fatty Acids",
          description: "Not all fats are created equal. Learn which fats to include in your diet and how they support your health and fitness goals.",
          category: "nutrition",
          author: "MacroMinded Team",
          date: new Date("2024-02-18").toISOString(),
          published: true,
          content: `<h2>Why You Need Healthy Fats</h2><p>Fats are essential for hormone production, vitamin absorption, brain function, and overall health. Aim for 0.3-0.5 grams per pound of body weight daily.</p><h3>Types of Fats</h3><h4>Monounsaturated Fats (MUFAs)</h4><p>Found in olive oil, avocados, and nuts. These support heart health and reduce inflammation.</p><h4>Polyunsaturated Fats (PUFAs)</h4><p>Include omega-3 and omega-6 fatty acids. Omega-3s from fish, walnuts, and flaxseeds are especially important for brain and heart health.</p><h4>Saturated Fats</h4><p>Found in animal products and coconut oil. Include in moderation as part of a balanced diet.</p><h2>Best Sources of Healthy Fats</h2><ul><li><strong>Avocados:</strong> 15g fat per half</li><li><strong>Nuts & Seeds:</strong> Almonds, walnuts, chia seeds</li><li><strong>Olive Oil:</strong> Use for cooking and dressings</li><li><strong>Fatty Fish:</strong> Salmon, mackerel, sardines</li><li><strong>Egg Yolks:</strong> Don't skip the yolk!</li><li><strong>Nut Butters:</strong> Natural peanut butter, almond butter</li></ul><h2>Fats to Limit</h2><p>Avoid trans fats completely. Limit processed foods high in unhealthy fats. Read labels and choose whole food sources when possible.</p><h2>Fat and Weight Loss</h2><p>Despite being calorie-dense (9 calories per gram), healthy fats can actually support weight loss by:</p><ul><li>Keeping you satiated</li><li>Supporting hormone balance</li><li>Improving nutrient absorption</li><li>Reducing cravings</li></ul><h2>Practical Tips</h2><p>Add a serving of healthy fats to each meal. Drizzle olive oil on vegetables, add avocado to salads, or include nuts as a snack. Balance is key!</p>`,
        },
        {
          slug: "tracking-macros-beginners",
          title: "Macro Tracking for Beginners: Start Your Journey",
          description: "New to macro counting? This beginner-friendly guide will walk you through everything you need to know to start tracking macros successfully.",
          category: "nutrition",
          author: "MacroMinded Team",
          date: new Date("2024-02-25").toISOString(),
          published: true,
          content: `<h2>Getting Started with Macro Tracking</h2><p>Macro tracking doesn't have to be overwhelming. Start simple and build consistency. Here's your step-by-step guide.</p><h3>Step 1: Calculate Your Macros</h3><p>Use our MacroMinded calculator to determine your daily protein, carb, and fat targets based on your goals, activity level, and body composition.</p><h3>Step 2: Choose a Tracking App</h3><p>Popular apps like MyFitnessPal, Cronometer, or MacroFactor make tracking easy. Log everything you eat for at least a week to build the habit.</p><h3>Step 3: Invest in a Food Scale</h3><p>Weighing your food is the most accurate way to track. Volume measurements (cups, spoons) can be inconsistent.</p><h2>Common Beginner Mistakes</h2><ul><li><strong>Being too strict:</strong> Allow some flexibility, especially when starting</li><li><strong>Not weighing food:</strong> Estimates lead to inaccurate tracking</li><li><strong>Forgetting condiments:</strong> Those calories add up!</li><li><strong>Not planning ahead:</strong> Meal prep makes tracking easier</li></ul><h2>Tips for Success</h2><ul><li>Track before you eat, not after</li><li>Log everything, even "cheat" meals</li><li>Be patient - it takes 2-3 weeks to build the habit</li><li>Focus on hitting protein first, then fill in carbs and fats</li><li>Don't stress about being perfect - aim for 80% accuracy</li></ul><h2>Building the Habit</h2><p>Start by tracking just one meal per day, then gradually increase. Within a few weeks, tracking will become second nature.</p><h2>When to Adjust</h2><p>Review your progress after 2-4 weeks. If you're not seeing results, adjust your macros. Remember, your needs change as your body composition changes.</p><p>Macro tracking is a tool, not a prison. Use it to learn about your body and make informed choices about your nutrition.</p>`,
        },
        {
          slug: "weight-loss-plateau-breakthrough",
          title: "Breaking Through Weight Loss Plateaus: A Strategic Guide",
          description: "Stuck at the same weight despite your efforts? Learn proven strategies to break through plateaus and continue making progress toward your goals.",
          category: "nutrition",
          author: "MacroMinded Team",
          date: new Date("2024-03-05").toISOString(),
          published: true,
          content: `<h2>Understanding Weight Loss Plateaus</h2><p>Weight loss plateaus are a normal part of the journey. As you lose weight, your metabolism adapts, and your body requires fewer calories. This is when strategic adjustments become crucial.</p><h3>Why Plateaus Happen</h3><p>Your body is incredibly adaptive. When you consistently eat fewer calories, it becomes more efficient at using energy. This metabolic adaptation is natural but can stall progress.</p><h2>Strategies to Break Through</h2><h3>1. Recalculate Your Macros</h3><p>If you've lost significant weight, your maintenance calories have decreased. Recalculate your macros based on your current weight, not your starting weight.</p><h3>2. Implement a Diet Break</h3><p>Take 1-2 weeks eating at maintenance calories. This can help reset hormones, improve metabolism, and give you a mental break from restriction.</p><h3>3. Increase Activity</h3><p>Add more movement to your day. This doesn't mean more intense workouts—simply walking more, taking stairs, or adding light activity can help.</p><h3>4. Adjust Your Macros</h3><p>Try shifting your macro ratios. Some people respond better to higher protein and lower carbs, while others need more carbs for energy and performance.</p><h3>5. Track More Accurately</h3><p>Be honest about your tracking. Are you weighing everything? Are you accounting for cooking oils, condiments, and beverages? Small inaccuracies add up.</p><h2>Common Mistakes During Plateaus</h2><ul><li>Cutting calories too aggressively</li><li>Overdoing cardio at the expense of strength training</li><li>Not getting enough sleep or managing stress</li><li>Giving up too soon—plateaus can last 2-4 weeks</li></ul><h2>When to Seek Help</h2><p>If you've tried multiple strategies and still aren't seeing progress after 6-8 weeks, consider working with a nutrition coach. Sometimes an outside perspective can identify issues you might miss.</p><p>Remember, plateaus are temporary. Stay consistent, be patient, and trust the process. Your body is still changing even when the scale isn't moving.</p>`,
        },
        {
          slug: "high-protein-breakfast-recipes",
          title: "10 High-Protein Breakfast Recipes to Fuel Your Day",
          description: "Start your day right with these delicious, macro-friendly breakfast recipes that pack a protein punch and keep you satisfied until lunch.",
          category: "recipes",
          author: "MacroMinded Team",
          date: new Date("2024-03-12").toISOString(),
          published: true,
          content: `<h2>Why Protein at Breakfast Matters</h2><p>Starting your day with adequate protein helps control appetite, stabilize blood sugar, and support muscle maintenance. Aim for 25-40 grams of protein at breakfast.</p><h3>1. Greek Yogurt Protein Bowl</h3><p><strong>Macros:</strong> 35g protein, 15g carbs, 5g fat</p><p>Mix 1 cup Greek yogurt with 1 scoop vanilla protein powder. Top with berries, granola, and a drizzle of honey. Quick, delicious, and protein-packed.</p><h3>2. Scrambled Eggs with Turkey Sausage</h3><p><strong>Macros:</strong> 40g protein, 5g carbs, 20g fat</p><p>Scramble 3 whole eggs with 2 oz turkey sausage. Serve with a side of vegetables. High protein, low carb, perfect for fat loss goals.</p><h3>3. Protein Pancakes</h3><p><strong>Macros:</strong> 30g protein, 35g carbs, 8g fat</p><p>Blend 1 scoop protein powder, 1/2 cup oats, 1 egg, and 1/4 cup egg whites. Cook like regular pancakes. Top with fruit and sugar-free syrup.</p><h3>4. Cottage Cheese Bowl</h3><p><strong>Macros:</strong> 28g protein, 10g carbs, 2g fat</p><p>1 cup cottage cheese topped with sliced peaches, almonds, and a sprinkle of cinnamon. Simple, satisfying, and high in casein protein.</p><h3>5. Breakfast Burrito</h3><p><strong>Macros:</strong> 35g protein, 40g carbs, 15g fat</p><p>Whole wheat tortilla filled with scrambled eggs, black beans, turkey, and avocado. Make ahead and freeze for quick weekday mornings.</p><h3>6. Protein Smoothie</h3><p><strong>Macros:</strong> 40g protein, 30g carbs, 5g fat</p><p>Blend 1 scoop protein powder, 1 banana, 1 cup milk, 1 tbsp almond butter, and ice. Perfect for on-the-go mornings.</p><h3>7. Overnight Oats with Protein</h3><p><strong>Macros:</strong> 32g protein, 45g carbs, 10g fat</p><p>Mix 1/2 cup oats, 1 scoop protein powder, 1 cup milk, and chia seeds. Refrigerate overnight. Top with fruit in the morning.</p><h3>8. Smoked Salmon and Eggs</h3><p><strong>Macros:</strong> 38g protein, 3g carbs, 18g fat</p><p>Two poached eggs served over 3 oz smoked salmon with capers and red onion. Rich in omega-3s and high-quality protein.</p><h3>9. Breakfast Quinoa Bowl</h3><p><strong>Macros:</strong> 25g protein, 50g carbs, 8g fat</p><p>Cooked quinoa mixed with Greek yogurt, berries, nuts, and a drizzle of maple syrup. A complete protein source with complex carbs.</p><h3>10. Protein French Toast</h3><p><strong>Macros:</strong> 35g protein, 40g carbs, 12g fat</p><p>Dip whole grain bread in a mixture of eggs, protein powder, and cinnamon. Cook until golden. Serve with berries and Greek yogurt.</p><h2>Meal Prep Tips</h2><p>Many of these can be prepped ahead. Make protein pancakes in bulk and freeze. Prepare overnight oats for the week. Hard-boil eggs for quick protein on busy mornings.</p><p>Experiment with these recipes and adjust portions to fit your specific macro targets. Breakfast sets the tone for your day—make it count!</p>`,
        },
        {
          slug: "strength-training-nutrition-guide",
          title: "Nutrition for Strength Training: Fuel Your Gains",
          description: "Learn how to optimize your nutrition to support strength training, muscle growth, and recovery. Discover the best pre and post-workout nutrition strategies.",
          category: "fitness",
          author: "MacroMinded Team",
          date: new Date("2024-03-20").toISOString(),
          published: true,
          content: `<h2>Nutrition's Role in Strength Training</h2><p>Proper nutrition is just as important as your training program. Without adequate fuel and recovery nutrition, you'll struggle to build muscle and strength effectively.</p><h3>Calorie Surplus for Muscle Gain</h3><p>To build muscle, you need to be in a slight calorie surplus—typically 250-500 calories above maintenance. This provides the energy needed for muscle protein synthesis.</p><h2>Macro Breakdown for Strength Training</h2><h3>Protein: The Foundation</h3><p>Aim for 1.0-1.2 grams per pound of body weight. Spread this across 4-6 meals throughout the day to maximize muscle protein synthesis.</p><h3>Carbohydrates: Your Energy Source</h3><p>Carbs fuel your workouts and replenish glycogen stores. Aim for 2-3 grams per pound of body weight, with more on training days.</p><h3>Fats: Don't Neglect Them</h3><p>Healthy fats support hormone production. Aim for 0.4-0.5 grams per pound of body weight daily.</p><h2>Pre-Workout Nutrition</h2><p>Eat a meal containing carbs and protein 2-3 hours before training. If training early, a smaller meal or shake 30-60 minutes before can work.</p><p><strong>Example Pre-Workout Meals:</strong></p><ul><li>Oatmeal with protein powder and banana</li><li>Chicken and rice</li><li>Greek yogurt with fruit</li><li>Protein smoothie with oats</li></ul><h2>Post-Workout Nutrition</h2><p>The post-workout window is important but not as critical as once thought. Aim to consume protein and carbs within 2-3 hours after training.</p><p><strong>Example Post-Workout Meals:</strong></p><ul><li>Protein shake with banana</li><li>Chicken, sweet potato, and vegetables</li><li>Eggs with toast and fruit</li><li>Greek yogurt with granola and berries</li></ul><h2>Hydration for Performance</h2><p>Dehydration significantly impacts strength and performance. Drink water throughout the day and consider adding electrolytes during intense training sessions.</p><h2>Supplements to Consider</h2><ul><li><strong>Creatine:</strong> 3-5g daily for strength and power</li><li><strong>Protein Powder:</strong> Convenient way to hit protein targets</li><li><strong>Beta-Alanine:</strong> May help with high-intensity training</li><li><strong>Multivitamin:</strong> Fill nutritional gaps</li></ul><h2>Common Mistakes</h2><ul><li>Not eating enough calories to support muscle growth</li><li>Skimping on protein</li><li>Neglecting carbs around workouts</li><li>Not staying hydrated</li><li>Overthinking meal timing—total daily intake matters most</li></ul><h2>Tracking Your Progress</h2><p>Monitor your strength gains, body composition changes, and how you feel. Adjust your nutrition based on results, not just the scale.</p><p>Remember, building strength and muscle takes time. Be consistent with both your training and nutrition, and the results will follow.</p>`,
        },
        {
          slug: "intermittent-fasting-macros",
          title: "Intermittent Fasting and Macro Tracking: A Complete Guide",
          description: "Can you combine intermittent fasting with macro tracking? Absolutely! Learn how to structure your eating window to hit your macro targets effectively.",
          category: "nutrition",
          author: "MacroMinded Team",
          date: new Date("2024-03-28").toISOString(),
          published: true,
          content: `<h2>What is Intermittent Fasting?</h2><p>Intermittent fasting (IF) involves cycling between periods of eating and fasting. Popular methods include 16:8 (16 hours fast, 8-hour eating window) and 18:6.</p><h3>Why Combine IF with Macro Tracking?</h3><p>IF can help with appetite control and meal timing, while macro tracking ensures you're getting the right nutrients. Together, they create a powerful approach to body composition goals.</p><h2>Popular IF Methods</h2><h3>16:8 Method</h3><p>Fast for 16 hours, eat within an 8-hour window. For example, eat between 12 PM and 8 PM, fast from 8 PM to 12 PM the next day.</p><h3>18:6 Method</h3><p>Fast for 18 hours, eat within a 6-hour window. More restrictive but can be effective for some people.</p><h3>5:2 Method</h3><p>Eat normally for 5 days, restrict calories to 500-600 on 2 non-consecutive days.</p><h2>Fitting Macros into Your Eating Window</h2><h3>Meal Structure</h3><p>With a shorter eating window, you'll need to be strategic about meal timing and portion sizes. Most people do well with 2-3 larger meals.</p><h3>Breaking Your Fast</h3><p>Start with a protein-rich meal. This helps preserve muscle mass and keeps you satiated. Include carbs if you're training later in the day.</p><h3>Pre-Workout Nutrition</h3><p>If training during your eating window, have a meal with carbs and protein 1-2 hours before. If training fasted, consider BCAAs or a small protein shake.</p><h2>Sample Meal Plans</h2><h3>16:8 Example (12 PM - 8 PM eating window)</h3><p><strong>12:00 PM - Meal 1:</strong> 40g protein, 60g carbs, 20g fat (chicken, rice, vegetables, avocado)</p><p><strong>4:00 PM - Meal 2:</strong> 35g protein, 50g carbs, 15g fat (salmon, sweet potato, broccoli)</p><p><strong>7:30 PM - Meal 3:</strong> 30g protein, 30g carbs, 20g fat (Greek yogurt, berries, nuts)</p><h2>Benefits of IF + Macros</h2><ul><li>Simplified meal planning with fewer meals</li><li>Better appetite control</li><li>Flexibility in meal timing</li><li>Can support fat loss while maintaining muscle</li></ul><h2>Who Should Avoid IF?</h2><ul><li>People with a history of eating disorders</li><li>Pregnant or breastfeeding women</li><li>Those with blood sugar regulation issues</li><li>People who feel weak or irritable when fasting</li></ul><h2>Common Mistakes</h2><ul><li>Not eating enough calories in the eating window</li><li>Neglecting protein intake</li><li>Overeating because you're "allowed" to</li><li>Not staying hydrated during the fast</li></ul><h2>Tips for Success</h2><p>Start with a longer eating window (14:10) and gradually shorten it. Stay busy during fasting hours. Drink plenty of water, black coffee, or tea. Track your macros even during your eating window.</p><p>IF isn't for everyone, and that's okay. The best approach is the one you can sustain long-term. If IF makes you miserable, stick with regular meal timing and focus on hitting your macros.</p>`,
        },
        {
          slug: "vegetarian-macro-tracking",
          title: "Vegetarian Macro Tracking: Complete Protein Sources Guide",
          description: "Following a vegetarian diet doesn't mean sacrificing your macro goals. Learn how to track macros effectively while eating plant-based.",
          category: "nutrition",
          author: "MacroMinded Team",
          date: new Date("2024-04-05").toISOString(),
          published: true,
          content: `<h2>Vegetarian Protein Sources</h2><p>Getting enough protein on a vegetarian diet is absolutely achievable. You just need to know which foods to prioritize and how to combine them effectively.</p><h3>Complete Protein Sources</h3><ul><li><strong>Eggs:</strong> 6g protein per large egg</li><li><strong>Dairy:</strong> Greek yogurt (20g per cup), cottage cheese (25g per cup), milk (8g per cup)</li><li><strong>Quinoa:</strong> 8g protein per cooked cup</li><li><strong>Hemp seeds:</strong> 10g protein per 3 tablespoons</li><li><strong>Chia seeds:</strong> 5g protein per 2 tablespoons</li></ul><h3>Incomplete Proteins (Combine for Complete)</h3><ul><li><strong>Legumes:</strong> Lentils (18g per cooked cup), chickpeas (15g per cooked cup), black beans (15g per cooked cup)</li><li><strong>Grains:</strong> Brown rice (5g per cooked cup), oats (6g per cooked cup)</li><li><strong>Nuts & Seeds:</strong> Almonds (6g per ounce), peanuts (7g per ounce)</li><li><strong>Soy:</strong> Tofu (20g per cup), tempeh (31g per cup), edamame (17g per cup)</li></ul><h2>Sample Vegetarian Meal Plan</h2><h3>Breakfast</h3><p>Greek yogurt bowl with berries, granola, and hemp seeds. <strong>Macros:</strong> 30g protein, 45g carbs, 12g fat</p><h3>Lunch</h3><p>Quinoa bowl with chickpeas, roasted vegetables, and tahini dressing. <strong>Macros:</strong> 25g protein, 60g carbs, 18g fat</p><h3>Dinner</h3><p>Tofu stir-fry with brown rice and vegetables. <strong>Macros:</strong> 35g protein, 55g carbs, 15g fat</p><h3>Snacks</h3><p>Protein smoothie with plant-based protein powder, or cottage cheese with fruit.</p><h2>Hitting Protein Targets</h2><p>If you're struggling to hit protein goals, consider:</p><ul><li>Adding protein powder to smoothies and oatmeal</li><li>Including eggs or dairy at every meal</li><li>Snacking on Greek yogurt or cottage cheese</li><li>Using tofu, tempeh, or seitan as main protein sources</li><li>Combining legumes with grains for complete proteins</li></ul><h2>Carb Sources for Vegetarians</h2><p>Vegetarians typically have no trouble getting carbs. Focus on whole grains, fruits, vegetables, and legumes for nutrient-dense options.</p><h2>Fat Sources</h2><p>Nuts, seeds, avocados, olive oil, and full-fat dairy products provide healthy fats. Don't be afraid to include these in your meals.</p><h2>Common Challenges</h2><ul><li><strong>Protein density:</strong> Plant proteins are often less dense than animal proteins</li><li><strong>Volume:</strong> You may need to eat larger portions to hit protein goals</li><li><strong>Digestion:</strong> Some people experience bloating with high legume intake</li></ul><h2>Tips for Success</h2><p>Plan meals around protein sources. Track everything, including plant-based proteins. Don't forget about protein in vegetables—broccoli, spinach, and peas all contribute. Consider a plant-based protein powder if you're struggling to hit targets.</p><p>Vegetarian macro tracking is completely doable with proper planning. Focus on variety, combine complementary proteins, and don't be afraid to use protein supplements if needed.</p>`,
        },
        {
          slug: "meal-timing-myths-facts",
          title: "Meal Timing: Myths vs. Facts in Macro Tracking",
          description: "Does meal timing really matter? We break down the science behind when you eat and how it affects your results.",
          category: "nutrition",
          author: "MacroMinded Team",
          date: new Date("2024-04-12").toISOString(),
          published: true,
          content: `<h2>The Truth About Meal Timing</h2><p>Meal timing has been both overhyped and misunderstood. Let's separate the myths from the facts based on current research.</p><h3>Myth: You Must Eat Every 2-3 Hours</h3><p><strong>Fact:</strong> Meal frequency doesn't significantly impact metabolism or fat loss. Total daily calories and macros matter far more than when you eat them.</p><h3>Myth: Eating at Night Causes Weight Gain</h3><p><strong>Fact:</strong> Calories are calories, regardless of when you consume them. What matters is your total daily intake, not the timing.</p><h3>Myth: You Must Eat Immediately After Training</h3><p><strong>Fact:</strong> The "anabolic window" is much wider than once thought. You have 2-3 hours post-workout to consume protein and carbs effectively.</p><h2>When Meal Timing DOES Matter</h2><h3>For Performance</h3><p>If you're training fasted or early in the morning, having carbs before or during your workout can improve performance. For strength training, having protein and carbs within a few hours post-workout supports recovery.</p><h3>For Appetite Control</h3><p>Some people find that eating more frequently helps control hunger, while others do better with fewer, larger meals. This is individual preference, not a metabolic requirement.</p><h3>For Muscle Building</h3><p>Spreading protein intake throughout the day (every 3-4 hours) can optimize muscle protein synthesis, but total daily protein is still the most important factor.</p><h2>Practical Recommendations</h2><h3>For Fat Loss</h3><p>Focus on total daily calories and macros. Meal timing is secondary. Eat when it fits your schedule and helps you stick to your plan.</p><h3>For Muscle Gain</h3><p>Prioritize protein distribution throughout the day. Have a meal with protein and carbs around your workout, but don't stress about exact timing.</p><h3>For General Health</h3><p>Listen to your body. Eat when you're hungry, stop when you're satisfied. Regular meal patterns can help with consistency, but flexibility is important too.</p><h2>What the Research Says</h2><p>Multiple studies show that meal frequency doesn't significantly impact weight loss when calories are matched. However, meal timing can affect:</p><ul><li>Workout performance</li><li>Recovery</li><li>Appetite and satiety</li><li>Sleep quality (eating too close to bedtime can disrupt sleep for some)</li></ul><h2>Best Practices</h2><ul><li>Prioritize total daily macros over meal timing</li><li>Eat in a way that fits your lifestyle and preferences</li><li>Consider meal timing for performance if you're an athlete</li><li>Don't stress about perfect timing—consistency with your macros is more important</li><li>Experiment to find what works best for you</li></ul><h2>The Bottom Line</h2><p>Meal timing is a tool, not a requirement. For most people, hitting your daily macro and calorie targets is far more important than when you eat. Use meal timing to support your goals, but don't let it become a source of stress or restriction.</p><p>Focus on the big picture: consistent macro tracking, adequate protein intake, and a sustainable approach that fits your life. That's what will drive real, lasting results.</p>`,
        },
        {
          slug: "bulking-guide-clean-gains",
          title: "Clean Bulking Guide: Gain Muscle Without Excess Fat",
          description: "Learn how to bulk effectively by gaining muscle while minimizing fat gain. Discover the optimal calorie surplus and macro ratios for clean bulking.",
          category: "fitness",
          author: "MacroMinded Team",
          date: new Date("2024-04-20").toISOString(),
          published: true,
          content: `<h2>What is Clean Bulking?</h2><p>Clean bulking involves eating in a slight calorie surplus to support muscle growth while minimizing fat gain. The goal is to gain weight slowly and primarily as muscle.</p><h3>Clean vs. Dirty Bulking</h3><p>Dirty bulking involves eating a large calorie surplus with little regard for food quality. This leads to excessive fat gain. Clean bulking focuses on a moderate surplus with nutrient-dense foods.</p><h2>Determining Your Calorie Surplus</h2><p>For clean bulking, aim for a 250-500 calorie surplus above maintenance. This provides enough energy for muscle growth without excessive fat storage.</p><h3>Calculating Your Surplus</h3><p>Start by calculating your maintenance calories. Then add 250-500 calories. Monitor your progress and adjust based on how quickly you're gaining weight.</p><h2>Optimal Macro Ratios for Bulking</h2><h3>Protein</h3><p>Maintain high protein intake: 1.0-1.2 grams per pound of body weight. This supports muscle protein synthesis and helps minimize fat gain.</p><h3>Carbohydrates</h3><p>Increase carbs to fuel workouts and support recovery. Aim for 2.5-3.5 grams per pound of body weight, with more on training days.</p><h3>Fats</h3><p>Keep fats moderate: 0.4-0.5 grams per pound of body weight. This supports hormone production without adding excessive calories.</p><h2>Rate of Weight Gain</h2><p>Aim to gain 0.5-1 pound per week. If you're gaining faster, reduce your surplus. If you're not gaining, increase it slightly.</p><h3>What to Expect</h3><p>In your first year of proper training and nutrition, you might gain 10-20 pounds of muscle. After that, gains slow significantly. Be patient and realistic.</p><h2>Food Choices for Clean Bulking</h2><p>Focus on nutrient-dense foods that support your goals:</p><ul><li><strong>Proteins:</strong> Lean meats, fish, eggs, dairy, protein powder</li><li><strong>Carbs:</strong> Oats, rice, sweet potatoes, quinoa, fruits</li><li><strong>Fats:</strong> Nuts, seeds, avocados, olive oil, fatty fish</li><li><strong>Vegetables:</strong> Plenty of vegetables for micronutrients</li></ul><h2>Training Considerations</h2><p>Your training should focus on progressive overload. You're eating more to support harder training, not as an excuse to train less.</p><h3>Key Principles</h3><ul><li>Progressive overload in your main lifts</li><li>Adequate volume for muscle growth</li><li>Proper recovery between sessions</li><li>Consistency over intensity</li></ul><h2>Monitoring Progress</h2><p>Track more than just the scale:</p><ul><li>Body weight (weekly average)</li><li>Body measurements (waist, arms, chest, thighs)</li><li>Strength progress</li><li>Photos (monthly)</li><li>How your clothes fit</li></ul><h2>When to End a Bulk</h2><p>Consider ending your bulk when:</p><ul><li>You've gained 15-20% body fat (if starting lean)</li><li>You're no longer making strength gains</li><li>You've been bulking for 4-6 months</li><li>You want to improve definition</li></ul><h2>Common Mistakes</h2><ul><li>Eating too large of a surplus</li><li>Not tracking macros accurately</li><li>Neglecting training intensity</li><li>Gaining weight too quickly</li><li>Not adjusting as you gain weight</li></ul><h2>Tips for Success</h2><p>Be patient—muscle gain is slow. Stay consistent with both training and nutrition. Adjust your surplus based on progress. Don't be afraid to take diet breaks. Remember, you'll need to cut eventually, so minimize fat gain now.</p><p>Clean bulking requires discipline and patience, but the results—more muscle with less fat to lose later—are worth it. Focus on the process, track your progress, and trust the journey.</p>`,
        },
      ];

      const articlesRef = collection(db, "blog");
      
      // Filter out articles that already exist
      const newArticles = sampleArticles.filter((article) => !existingSlugs.has(article.slug));
      
      if (newArticles.length === 0) {
        toast({
          title: "No New Articles",
          description: "All sample articles already exist in the blog.",
        });
        setAddingArticles(false);
        return;
      }

      const promises = newArticles.map((article) =>
        addDoc(articlesRef, {
          ...article,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
      );

      await Promise.all(promises);
      toast({
        title: "Articles Added",
        description: `Successfully added ${newArticles.length} new article${newArticles.length > 1 ? 's' : ''} to the blog! ${sampleArticles.length - newArticles.length > 0 ? `${sampleArticles.length - newArticles.length} skipped (already exist).` : ''}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add articles.",
        variant: "destructive",
      });
    } finally {
      setAddingArticles(false);
    }
  };

  const handleDelete = async () => {
    if (!postToDelete) return;

    try {
      await deleteDoc(doc(db, "blog", postToDelete));
      toast({
        title: "Article Deleted",
        description: "The article has been removed from the blog.",
      });
      setDeleteModalOpen(false);
      setPostToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete article.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2E2E]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Blog <span className="text-[#FF2E2E]">Management</span>
          </h1>
          <p className="text-gray-400">Manage blog articles and content</p>
        </div>
        <Button
          onClick={handleAddSampleArticles}
          disabled={addingArticles}
          className="bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {addingArticles ? "Adding..." : "Add Sample Articles"}
        </Button>
      </div>

      {/* Articles List */}
      {posts.length === 0 ? (
        <div className="bg-[#151515] border border-[#222] rounded-2xl p-12 text-center">
          <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Articles Yet</h3>
          <p className="text-gray-400 mb-6">
            Get started by adding sample articles or create your own.
          </p>
          <Button
            onClick={handleAddSampleArticles}
            disabled={addingArticles}
            className="bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Sample Articles
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#151515] border border-[#222] rounded-2xl p-6 hover:border-[#FF2E2E]/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-2">{post.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">{post.description}</p>
                  {post.category && (
                    <span className="inline-block px-2 py-1 bg-[#FF2E2E]/20 text-[#FF2E2E] text-xs rounded">
                      {post.category}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-[#222]">
                <span className="text-xs text-gray-500">
                  {new Date(post.date).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[#222] hover:bg-[#FF2E2E]/20 text-gray-400 hover:text-white transition-colors"
                    title="View"
                  >
                    <FileText className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => {
                      setPostToDelete(post.id);
                      setDeleteModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-[#222] hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPostToDelete(null);
        }}
        title="Delete Article"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete this article? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setPostToDelete(null);
              }}
              className="flex-1 px-4 py-2 rounded-lg bg-[#222] hover:bg-[#333] text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

