import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Plus, Menu, MessageSquare } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Streamdown } from "streamdown";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const utils = trpc.useUtils();

  // Fetch conversations
  const { data: conversations = [] } = trpc.conversations.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch messages for current conversation
  const { data: messages = [], isLoading: messagesLoading } = trpc.conversations.getMessages.useQuery(
    { conversationId: currentConversationId! },
    { enabled: !!currentConversationId }
  );

  // Send message mutation
  const sendMutation = trpc.chat.send.useMutation({
    onSuccess: () => {
      utils.conversations.getMessages.invalidate({ conversationId: currentConversationId! });
      utils.conversations.list.invalidate();
      setMessage("");
    },
    onError: (error) => {
      toast.error("Failed to send message: " + error.message);
    },
  });

  // Create conversation mutation
  const createConversationMutation = trpc.conversations.create.useMutation({
    onSuccess: (data) => {
      setCurrentConversationId(data.conversationId);
      utils.conversations.list.invalidate();
      setIsSidebarOpen(false);
    },
  });

  // Delete conversation mutation
  const deleteConversationMutation = trpc.conversations.delete.useMutation({
    onSuccess: () => {
      utils.conversations.list.invalidate();
      if (conversations.length > 0) {
        setCurrentConversationId(conversations[0].id);
      } else {
        setCurrentConversationId(null);
      }
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize with first conversation or create new one
  useEffect(() => {
    if (isAuthenticated && conversations.length > 0 && !currentConversationId) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, currentConversationId, isAuthenticated]);

  const handleSend = async () => {
    if (!message.trim() || !isAuthenticated) return;

    // If no conversation exists, create one with the message as title
    if (!currentConversationId) {
      const title = message.slice(0, 50) + (message.length > 50 ? "..." : "");
      await createConversationMutation.mutateAsync({ title });
      return;
    }

    sendMutation.mutate({
      conversationId: currentConversationId,
      message: message.trim(),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewConversation = () => {
    const title = `New Chat ${new Date().toLocaleString()}`;
    createConversationMutation.mutate({ title });
  };

  const ConversationSidebar = () => (
    <div className="flex flex-col h-full bg-muted/30">
      <div className="p-4 border-b border-border">
        <Button
          onClick={handleNewConversation}
          className="w-full"
          disabled={createConversationMutation.isPending}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                currentConversationId === conv.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-accent"
              }`}
              onClick={() => {
                setCurrentConversationId(conv.id);
                setIsSidebarOpen(false);
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{conv.title}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {conv.messageCount} messages
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this conversation?")) {
                      deleteConversationMutation.mutate({ conversationId: conv.id });
                    }
                  }}
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-4xl font-bold text-white">Welcome to AI Unk</h1>
          <p className="text-xl text-gray-300">Your Digital Mentor for Tech Mastery</p>
          <Button
            size="lg"
            onClick={() => setLocation("/login")}
            className="mt-4"
          >
            Sign In to Get Started
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 border-r border-border">
        <ConversationSidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <ConversationSidebar />
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            <MessageSquare className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-lg font-bold">AI Unk</h1>
              <p className="text-xs text-muted-foreground">The Wizard of the Hustle</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => setLocation("/about")}>
              About
            </Button>
            {user?.role === "admin" && (
              <Button variant="ghost" onClick={() => setLocation("/admin")}>
                Admin
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {!currentConversationId ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4 max-w-md">
                <h2 className="text-2xl font-bold">Start a Conversation</h2>
                <p className="text-muted-foreground">
                  Ask me anything about tech, coding, or building your hustle. I'm here to guide
                  you to success, lil' nephew!
                </p>
              </div>
            </div>
          ) : messagesLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <Streamdown>{msg.content}</Streamdown>
                    <p className="text-xs opacity-70 mt-2">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {sendMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area - Fixed at bottom */}
        <div className="border-t border-border p-4 bg-background">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI Unk anything..."
              className="resize-none min-h-[60px] max-h-[200px]"
              disabled={sendMutation.isPending}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sendMutation.isPending}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              {sendMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
