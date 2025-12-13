import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Zap, Target, TrendingUp, Award } from "lucide-react";
import { useLocation } from "wouter";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-white">About AI Unk</h1>
            <p className="text-gray-300">The Wizard of the Hustle</p>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-8">
            <div className="space-y-6 text-white">
              <h2 className="text-3xl font-bold">Who is AI Unk?</h2>
              <p className="text-lg text-gray-200 leading-relaxed">
                AI Unk is not just another chatbot. I'm your digital mentor, your guide through the
                complex world of technology and entrepreneurship. I've been "in the game" since the
                dawn of the internet, and I'm here to share that wisdom with you, my lil' nephew or
                niece.
              </p>
              <p className="text-lg text-gray-200 leading-relaxed">
                My mission is simple: guide you to financial independence through technology mastery.
                I don't just give you information - I give you wisdom, street smarts combined with
                technical expertise. I'm here to help you level up and get that bag.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 text-white">
                  <h3 className="text-xl font-bold mb-2">Street-Smart Wisdom</h3>
                  <p className="text-gray-300">
                    I combine technical expertise with real-world experience. No fluff, just
                    practical advice that gets results.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 text-white">
                  <h3 className="text-xl font-bold mb-2">Action-Oriented</h3>
                  <p className="text-gray-300">
                    Every piece of advice I give is designed to move you forward. No theory for
                    theory's sake - only actionable steps.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 text-white">
                  <h3 className="text-xl font-bold mb-2">Success-Focused</h3>
                  <p className="text-gray-300">
                    Everything connects back to your success and financial independence. I'm here
                    to help you get the bag.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 text-white">
                  <h3 className="text-xl font-bold mb-2">Genuine Care</h3>
                  <p className="text-gray-300">
                    You're not just a user - you're my lil' nephew/niece. I genuinely care about
                    your growth and success.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How I Work */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-8">
            <div className="space-y-6 text-white">
              <h2 className="text-3xl font-bold">How I Work</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">🎯 Personalized Guidance</h3>
                  <p className="text-gray-300">
                    I remember our conversations and build on them. The more we talk, the better I
                    understand your goals and can tailor my advice.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">💡 Cheat Codes</h3>
                  <p className="text-gray-300">
                    I provide practical shortcuts and insider tips - the "cheat codes" that
                    experienced developers and entrepreneurs use.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">🛡️ Pitfall Protection</h3>
                  <p className="text-gray-300">
                    I warn you about common mistakes before you make them. Learn from my experience,
                    not your own expensive errors.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">🎉 Celebrate Wins</h3>
                  <p className="text-gray-300">
                    I acknowledge your progress and celebrate your achievements. Every step forward
                    matters.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Level Up?</h2>
            <p className="text-xl text-white/90 mb-6">
              Let's start your journey to tech mastery and financial independence.
            </p>
            <Button
              size="lg"
              onClick={() => setLocation("/")}
              className="bg-white text-purple-900 hover:bg-gray-100"
            >
              Start Chatting with AI Unk
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
