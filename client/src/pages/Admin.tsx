import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, CheckCircle, XCircle, Settings } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { data: providers = [], isLoading } = trpc.admin.providers.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: auditLogs = [] } = trpc.admin.auditLogs.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const updateProviderMutation = trpc.admin.updateProvider.useMutation({
    onSuccess: () => {
      utils.admin.providers.invalidate();
      toast.success("Provider settings updated");
    },
    onError: (error) => {
      toast.error("Failed to update provider: " + error.message);
    },
  });

  const testProviderMutation = trpc.admin.testProvider.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Connection successful! Latency: ${data.latencyMs}ms`);
      } else {
        toast.error(`Connection failed: ${data.message}`);
      }
      setTestingProvider(null);
    },
    onError: (error) => {
      toast.error("Test failed: " + error.message);
      setTestingProvider(null);
    },
  });

  if (!isAuthenticated || user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  const ProviderCard = ({ provider }: { provider: any }) => {
    const [apiKey, setApiKey] = useState(provider.apiKey || "");
    const [model, setModel] = useState(provider.model || "");
    const [isActive, setIsActive] = useState(provider.isActive || false);

    const handleSave = () => {
      updateProviderMutation.mutate({
        providerId: provider.providerId,
        model,
        apiKey,
        isActive,
      });
    };

    const handleTest = () => {
      setTestingProvider(provider.providerId);
      testProviderMutation.mutate({
        providerId: provider.providerId,
        model,
        apiKey,
      });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{provider.providerId}</span>
            {provider.isActive && (
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">Active</span>
            )}
          </CardTitle>
          <CardDescription>
            Used {provider.usageCount} times
            {provider.lastUsed && ` • Last used: ${new Date(provider.lastUsed).toLocaleString()}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`model-${provider.id}`}>Model</Label>
            <Input
              id={`model-${provider.id}`}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g., gpt-4-turbo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`apikey-${provider.id}`}>API Key</Label>
            <Input
              id={`apikey-${provider.id}`}
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor={`active-${provider.id}`}>Set as Active Provider</Label>
            <Switch
              id={`active-${provider.id}`}
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleTest}
              variant="outline"
              disabled={testingProvider === provider.providerId || !apiKey}
              className="flex-1"
            >
              {testingProvider === provider.providerId ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Test Connection
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateProviderMutation.isPending}
              className="flex-1"
            >
              {updateProviderMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="w-8 h-8" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground">Manage AI providers and system settings</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <Tabs defaultValue="providers" className="space-y-6">
            <TabsList>
              <TabsTrigger value="providers">AI Providers</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
            </TabsList>

            <TabsContent value="providers" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {providers.length === 0 ? (
                  <Card className="col-span-2">
                    <CardContent className="py-8">
                      <p className="text-center text-muted-foreground">
                        No providers configured yet. Add provider settings to get started.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  providers.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))
                )}
              </div>

              {/* Quick Add Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Provider</CardTitle>
                  <CardDescription>
                    Configure a new AI provider by filling in the details above and saving
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Supported providers: Anthropic, OpenAI, Google
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Use provider IDs: "anthropic", "openai", "google"
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Audit Log</CardTitle>
                  <CardDescription>Recent system events and activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {auditLogs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No audit logs yet</p>
                  ) : (
                    <div className="space-y-2">
                      {auditLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-lg border border-border flex items-start gap-3"
                        >
                          {log.eventType === "error" ? (
                            <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">{log.eventType}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {log.details && (
                              <pre className="text-xs text-muted-foreground mt-1 overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
