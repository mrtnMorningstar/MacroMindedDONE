import { NextResponse } from "next/server";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const sampleArticles = [
  {
    slug: "ultimate-macro-guide-2024",
    title: "The Ultimate Macro Counting Guide for 2024",
    description: "Learn how to master macro counting and transform your nutrition approach. This comprehensive guide covers everything from calculating your macros to meal planning strategies.",
    category: "nutrition",
    author: "MacroMinded Team",
    date: new Date("2024-01-15").toISOString(),
    published: true,
    thumbnail: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=600&fit=crop&q=80",
    content: `
      <h2>What Are Macros?</h2>
      <p>Macronutrients, or "macros" for short, are the three main nutrients your body needs in large amounts: proteins, carbohydrates, and fats. Each plays a crucial role in your health and fitness goals.</p>
      
      <h3>Protein: The Building Block</h3>
      <p>Protein is essential for muscle repair, growth, and maintenance. Aim for 0.8-1.2 grams per pound of body weight, depending on your activity level and goals.</p>
      
      <h3>Carbohydrates: Your Energy Source</h3>
      <p>Carbs fuel your workouts and daily activities. Complex carbohydrates like whole grains, sweet potatoes, and quinoa provide sustained energy.</p>
      
      <h3>Fats: Essential for Health</h3>
      <p>Don't fear fats! Healthy fats from avocados, nuts, and olive oil support hormone production and nutrient absorption.</p>
      
      <h2>How to Calculate Your Macros</h2>
      <p>Start by determining your Total Daily Energy Expenditure (TDEE), then adjust based on your goals:</p>
      <ul>
        <li><strong>Weight Loss:</strong> 10-20% calorie deficit</li>
        <li><strong>Muscle Gain:</strong> 10-20% calorie surplus</li>
        <li><strong>Maintenance:</strong> Match your TDEE</li>
      </ul>
      
      <h2>Meal Planning Tips</h2>
      <p>Plan your meals in advance to hit your macro targets consistently. Use our MacroMinded calculator to get personalized recommendations based on your goals, activity level, and preferences.</p>
      
      <h2>Common Mistakes to Avoid</h2>
      <ul>
        <li>Not tracking accurately (weigh your food!)</li>
        <li>Ignoring micronutrients</li>
        <li>Being too restrictive</li>
        <li>Not adjusting as you progress</li>
      </ul>
      
      <p>Remember, consistency is key. Track your macros daily and adjust based on your results and how you feel.</p>
    `,
  },
  {
    slug: "meal-prep-sunday-success",
    title: "Meal Prep Sunday: Your Secret Weapon for Success",
    description: "Discover how dedicating just a few hours on Sunday can set you up for a week of healthy eating and macro success. Learn our proven meal prep strategies.",
    category: "meal-planning",
    author: "MacroMinded Team",
    date: new Date("2024-01-22").toISOString(),
    published: true,
    thumbnail: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&h=600&fit=crop&q=80",
    content: `
      <h2>Why Meal Prep Works</h2>
      <p>Meal prepping eliminates decision fatigue and ensures you always have macro-friendly meals ready. When healthy food is convenient, you're more likely to stick to your goals.</p>
      
      <h3>The Sunday Strategy</h3>
      <p>Dedicate 2-3 hours on Sunday to prepare your meals for the week. Here's our proven approach:</p>
      
      <h3>Step 1: Plan Your Menu</h3>
      <p>Choose 2-3 protein sources, 2-3 carb sources, and plenty of vegetables. Mix and match throughout the week to avoid boredom.</p>
      
      <h3>Step 2: Batch Cook</h3>
      <ul>
        <li>Cook proteins in bulk (chicken, ground turkey, fish)</li>
        <li>Roast vegetables on sheet pans</li>
        <li>Prepare grains and starches</li>
        <li>Portion into containers</li>
      </ul>
      
      <h3>Step 3: Store Properly</h3>
      <p>Use airtight containers and label with dates. Most prepped meals stay fresh for 4-5 days in the refrigerator.</p>
      
      <h2>Meal Prep Essentials</h2>
      <ul>
        <li>Quality food storage containers</li>
        <li>Food scale for accurate portions</li>
        <li>Sheet pans and baking dishes</li>
        <li>Slow cooker or Instant Pot</li>
      </ul>
      
      <h2>Time-Saving Tips</h2>
      <p>Prep ingredients, not just complete meals. Pre-cut vegetables, marinated proteins, and pre-portioned snacks can save time during the week.</p>
      
      <p>Start small with 2-3 days of prep, then gradually increase as you get comfortable with the process.</p>
    `,
  },
  {
    slug: "protein-power-building-muscle",
    title: "Protein Power: Building Muscle on a Macro-Based Diet",
    description: "Unlock the secrets of optimal protein intake for muscle growth. Learn when to eat protein, how much you need, and the best sources for your goals.",
    category: "fitness",
    author: "MacroMinded Team",
    date: new Date("2024-02-01").toISOString(),
    published: true,
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop&q=80",
    content: `
      <h2>The Role of Protein in Muscle Building</h2>
      <p>Protein provides the amino acids your muscles need to repair and grow after workouts. Without adequate protein, your body can't build new muscle tissue effectively.</p>
      
      <h3>How Much Protein Do You Need?</h3>
      <p>For muscle building, aim for 1.0-1.2 grams of protein per pound of body weight. If you weigh 150 pounds, that's 150-180 grams daily.</p>
      
      <h3>Best Protein Sources</h3>
      <ul>
        <li><strong>Lean Meats:</strong> Chicken breast, turkey, lean beef</li>
        <li><strong>Fish:</strong> Salmon, tuna, cod</li>
        <li><strong>Eggs:</strong> Whole eggs provide complete protein</li>
        <li><strong>Dairy:</strong> Greek yogurt, cottage cheese, whey protein</li>
        <li><strong>Plant-Based:</strong> Lentils, chickpeas, tofu, tempeh</li>
      </ul>
      
      <h2>Protein Timing</h2>
      <p>While total daily protein matters most, spreading it throughout the day (every 3-4 hours) can optimize muscle protein synthesis.</p>
      
      <h3>Post-Workout Protein</h3>
      <p>Consume 20-40 grams of protein within 2 hours of your workout to maximize recovery and muscle growth.</p>
      
      <h2>Protein Quality Matters</h2>
      <p>Complete proteins contain all essential amino acids. Animal sources are typically complete, while plant sources may need to be combined (like rice and beans).</p>
      
      <h2>Common Protein Mistakes</h2>
      <ul>
        <li>Not eating enough protein</li>
        <li>Relying too heavily on protein shakes</li>
        <li>Ignoring protein in vegetables</li>
        <li>Not adjusting intake as you gain muscle</li>
      </ul>
      
      <p>Remember, protein is just one piece of the puzzle. Combine it with proper training, adequate carbs for energy, and sufficient rest for optimal results.</p>
    `,
  },
  {
    slug: "carb-cycling-explained",
    title: "Carb Cycling Explained: When and How to Use It",
    description: "Learn about carb cycling, a strategic approach to carbohydrate intake that can help you break through plateaus and optimize your body composition.",
    category: "nutrition",
    author: "MacroMinded Team",
    date: new Date("2024-02-10").toISOString(),
    published: true,
    thumbnail: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1200&h=600&fit=crop&q=80",
    content: `
      <h2>What is Carb Cycling?</h2>
      <p>Carb cycling involves alternating between high-carb and low-carb days based on your activity level and goals. It's a strategic approach to managing your carbohydrate intake.</p>
      
      <h3>High-Carb Days</h3>
      <p>On training days, especially heavy lifting or intense cardio days, increase your carbs to fuel performance and recovery. This might mean 200-300+ grams depending on your size and activity.</p>
      
      <h3>Low-Carb Days</h3>
      <p>On rest days or light activity days, reduce carbs to 50-100 grams. This helps your body become more efficient at using fat for fuel.</p>
      
      <h2>Who Should Carb Cycle?</h2>
      <ul>
        <li>Athletes with varying training intensities</li>
        <li>Those looking to break through plateaus</li>
        <li>People who want more flexibility in their diet</li>
        <li>Advanced macro trackers</li>
      </ul>
      
      <h2>Sample Carb Cycling Schedule</h2>
      <p><strong>Monday (Heavy Legs):</strong> High carb (250g)</p>
      <p><strong>Tuesday (Rest):</strong> Low carb (75g)</p>
      <p><strong>Wednesday (Upper Body):</strong> High carb (250g)</p>
      <p><strong>Thursday (Cardio):</strong> Moderate carb (150g)</p>
      <p><strong>Friday (Full Body):</strong> High carb (250g)</p>
      <p><strong>Weekend:</strong> Low to moderate carb</p>
      
      <h2>Benefits of Carb Cycling</h2>
      <ul>
        <li>Better workout performance on high days</li>
        <li>Improved insulin sensitivity</li>
        <li>More dietary flexibility</li>
        <li>Can help with fat loss while maintaining muscle</li>
      </ul>
      
      <h2>Getting Started</h2>
      <p>Start with a simple 3-day cycle: high, low, moderate. Track your energy, performance, and results. Adjust based on how you feel and your progress.</p>
      
      <p>Remember, carb cycling is advanced. Master basic macro tracking first before adding this complexity.</p>
    `,
  },
  {
    slug: "healthy-fats-guide",
    title: "Healthy Fats: Your Guide to Essential Fatty Acids",
    description: "Not all fats are created equal. Learn which fats to include in your diet and how they support your health and fitness goals.",
    category: "nutrition",
    author: "MacroMinded Team",
    date: new Date("2024-02-18").toISOString(),
    published: true,
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop&q=80",
    content: `
      <h2>Why You Need Healthy Fats</h2>
      <p>Fats are essential for hormone production, vitamin absorption, brain function, and overall health. Aim for 0.3-0.5 grams per pound of body weight daily.</p>
      
      <h3>Types of Fats</h3>
      
      <h4>Monounsaturated Fats (MUFAs)</h4>
      <p>Found in olive oil, avocados, and nuts. These support heart health and reduce inflammation.</p>
      
      <h4>Polyunsaturated Fats (PUFAs)</h4>
      <p>Include omega-3 and omega-6 fatty acids. Omega-3s from fish, walnuts, and flaxseeds are especially important for brain and heart health.</p>
      
      <h4>Saturated Fats</h4>
      <p>Found in animal products and coconut oil. Include in moderation as part of a balanced diet.</p>
      
      <h2>Best Sources of Healthy Fats</h2>
      <ul>
        <li><strong>Avocados:</strong> 15g fat per half</li>
        <li><strong>Nuts & Seeds:</strong> Almonds, walnuts, chia seeds</li>
        <li><strong>Olive Oil:</strong> Use for cooking and dressings</li>
        <li><strong>Fatty Fish:</strong> Salmon, mackerel, sardines</li>
        <li><strong>Egg Yolks:</strong> Don't skip the yolk!</li>
        <li><strong>Nut Butters:</strong> Natural peanut butter, almond butter</li>
      </ul>
      
      <h2>Fats to Limit</h2>
      <p>Avoid trans fats completely. Limit processed foods high in unhealthy fats. Read labels and choose whole food sources when possible.</p>
      
      <h2>Fat and Weight Loss</h2>
      <p>Despite being calorie-dense (9 calories per gram), healthy fats can actually support weight loss by:</p>
      <ul>
        <li>Keeping you satiated</li>
        <li>Supporting hormone balance</li>
        <li>Improving nutrient absorption</li>
        <li>Reducing cravings</li>
      </ul>
      
      <h2>Practical Tips</h2>
      <p>Add a serving of healthy fats to each meal. Drizzle olive oil on vegetables, add avocado to salads, or include nuts as a snack. Balance is key!</p>
    `,
  },
  {
    slug: "tracking-macros-beginners",
    title: "Macro Tracking for Beginners: Start Your Journey",
    description: "New to macro counting? This beginner-friendly guide will walk you through everything you need to know to start tracking macros successfully.",
    category: "nutrition",
    author: "MacroMinded Team",
    date: new Date("2024-02-25").toISOString(),
    published: true,
    thumbnail: "https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?w=1200&h=600&fit=crop&q=80",
    content: `
      <h2>Getting Started with Macro Tracking</h2>
      <p>Macro tracking doesn't have to be overwhelming. Start simple and build consistency. Here's your step-by-step guide.</p>
      
      <h3>Step 1: Calculate Your Macros</h3>
      <p>Use our MacroMinded calculator to determine your daily protein, carb, and fat targets based on your goals, activity level, and body composition.</p>
      
      <h3>Step 2: Choose a Tracking App</h3>
      <p>Popular apps like MyFitnessPal, Cronometer, or MacroFactor make tracking easy. Log everything you eat for at least a week to build the habit.</p>
      
      <h3>Step 3: Invest in a Food Scale</h3>
      <p>Weighing your food is the most accurate way to track. Volume measurements (cups, spoons) can be inconsistent.</p>
      
      <h2>Common Beginner Mistakes</h2>
      <ul>
        <li><strong>Being too strict:</strong> Allow some flexibility, especially when starting</li>
        <li><strong>Not weighing food:</strong> Estimates lead to inaccurate tracking</li>
        <li><strong>Forgetting condiments:</strong> Those calories add up!</li>
        <li><strong>Not planning ahead:</strong> Meal prep makes tracking easier</li>
      </ul>
      
      <h2>Tips for Success</h2>
      <ul>
        <li>Track before you eat, not after</li>
        <li>Log everything, even "cheat" meals</li>
        <li>Be patient - it takes 2-3 weeks to build the habit</li>
        <li>Focus on hitting protein first, then fill in carbs and fats</li>
        <li>Don't stress about being perfect - aim for 80% accuracy</li>
      </ul>
      
      <h2>Building the Habit</h2>
      <p>Start by tracking just one meal per day, then gradually increase. Within a few weeks, tracking will become second nature.</p>
      
      <h2>When to Adjust</h2>
      <p>Review your progress after 2-4 weeks. If you're not seeing results, adjust your macros. Remember, your needs change as your body composition changes.</p>
      
      <p>Macro tracking is a tool, not a prison. Use it to learn about your body and make informed choices about your nutrition.</p>
    `,
  },
];

export async function POST() {
  try {
    const articlesRef = collection(db, "blog");
    const results = [];

    for (const article of sampleArticles) {
      const docRef = await addDoc(articlesRef, {
        ...article,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      results.push({ id: docRef.id, title: article.title });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully added ${results.length} articles`,
      articles: results,
    });
  } catch (error: any) {
    console.error("Error adding articles:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add articles",
      },
      { status: 500 }
    );
  }
}

