"use client";

import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-white">
            Terms of <span className="text-[#FF2E2E]">Service</span>
          </h1>
          <p className="text-gray-400 mb-12 text-lg">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing and using MacroMinded ("we," "us," or "our"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Services</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                MacroMinded provides custom meal planning services, including:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Personalized meal plans based on your goals, preferences, and dietary requirements</li>
                <li>Nutritional guidance and macro calculations</li>
                <li>Access to our client dashboard and chat support</li>
                <li>Plan updates and modifications (based on your selected plan tier)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                To access certain features of our service, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your information to keep it accurate, current, and complete</li>
                <li>Maintain the security of your password and identification</li>
                <li>Accept all responsibility for activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Payment Terms</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Our services are provided on a one-time payment basis. By purchasing a plan, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Pay the full amount at the time of purchase</li>
                <li>Provide accurate payment information</li>
                <li>Authorize us to charge your payment method for the selected plan</li>
                <li>Understand that all payments are processed securely through Stripe</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Prices are subject to change at any time, but changes will not affect plans already purchased.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Plan Delivery</h2>
              <p className="text-gray-300 leading-relaxed">
                After completing your questionnaire and payment, our nutrition experts will create your custom meal plan. Plan delivery times may vary based on complexity and current workload. You will be notified via email when your plan is ready and available in your dashboard.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                All content provided through MacroMinded, including meal plans, recipes, and nutritional information, is the exclusive property of MacroMinded and is protected by copyright and other intellectual property laws. You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Reproduce, distribute, or share your meal plan with third parties</li>
                <li>Use the content for commercial purposes</li>
                <li>Modify, create derivative works, or reverse engineer any content</li>
                <li>Remove any copyright or proprietary notices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Medical Disclaimer</h2>
              <p className="text-gray-300 leading-relaxed">
                The meal plans and nutritional information provided by MacroMinded are for informational and educational purposes only. They are not intended as medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider before starting any new diet or nutrition program, especially if you have a medical condition, are pregnant, or are taking medications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-300 leading-relaxed">
                MacroMinded shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services. Our total liability for any claims arising from or related to our services shall not exceed the amount you paid for your plan.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Termination</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to terminate or suspend your account and access to our services at our sole discretion, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Changes to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes via email or through our website. Your continued use of our services after such modifications constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Contact Information</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-gray-300 leading-relaxed mt-2">
                Email: <a href="mailto:support@macrominded.net" className="text-[#FF2E2E] hover:underline">support@macrominded.net</a>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

