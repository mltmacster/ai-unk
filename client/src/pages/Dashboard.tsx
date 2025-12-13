import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, TrendingUp, Award, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: progress, isLoading: progressLoading } = trpc.progress.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: conversations = [], isLoading: conversationsLoading } = trpc.conversations.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const isLoading = progressLoading || conversationsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
              <h1 className="text-3xl font-bold text-white">Your Progress</h1>
              <p className="text-gray-300">Track your journey with AI Unk</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <MessageSquare className="w-5 h-5" />
                    Conversations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-white">
                    {progress?.totalConversations || 0}
                  </p>
                  <p className="text-sm text-gray-300 mt-2">Total chats with AI Unk</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="w-5 h-5" />
                    Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-white">
                    {progress?.totalMessages || 0}
                  </p>
                  <p className="text-sm text-gray-300 mt-2">Messages exchanged</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Award className="w-5 h-5" />
                    Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-white">
                    {progress?.topicsDiscussed?.length || 0}
                  </p>
                  <p className="text-sm text-gray-300 mt-2">Topics explored</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Conversations */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Recent Conversations</CardTitle>
                <CardDescription className="text-gray-300">
                  Your latest chats with AI Unk
                </CardDescription>
              </CardHeader>
              <CardContent>
                {conversations.length === 0 ? (
                  <p className="text-gray-300 text-center py-8">
                    No conversations yet. Start chatting with AI Unk!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {conversations.slice(0, 5).map((conv) => (
                      <div
                        key={conv.id}
                        className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => setLocation("/")}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-white">{conv.title}</p>
                            <p className="text-sm text-gray-300 mt-1">
                              {conv.messageCount} messages • {new Date(conv.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/10"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Topics Discussed */}
            {progress?.topicsDiscussed && progress.topicsDiscussed.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Topics Discussed</CardTitle>
                  <CardDescription className="text-gray-300">
                    Areas you've explored with AI Unk
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {progress.topicsDiscussed.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            {progress?.achievements && progress.achievements.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Achievements</CardTitle>
                  <CardDescription className="text-gray-300">
                    Milestones you've reached
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {progress.achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                      >
                        <Award className="w-5 h-5 text-yellow-400" />
                        <span className="text-white">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
