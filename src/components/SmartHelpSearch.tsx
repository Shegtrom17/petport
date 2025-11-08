import { useState } from "react";
import { Search, Sparkles, Loader2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  type: "faq" | "troubleshooting";
  title: string;
  content: string;
  relevance: number;
  reason: string;
}

interface SearchResponse {
  results: SearchResult[];
  interpreted_intent: string;
}

export const SmartHelpSearch = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      console.log('[SMART-SEARCH] Searching for:', query);
      
      const { data, error } = await supabase.functions.invoke('search-help', {
        body: { query }
      });

      if (error) {
        console.error('[SMART-SEARCH] Error:', error);
        throw error;
      }

      console.log('[SMART-SEARCH] Results:', data);
      setSearchResults(data);

      if (data.results.length === 0) {
        toast.info("No results found. Try rephrasing your question.");
      }

    } catch (error: any) {
      console.error('[SMART-SEARCH] Search failed:', error);
      toast.error(error.message || "Search failed. Please try again.");
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getRelevanceBadge = (relevance: number) => {
    if (relevance >= 80) return <Badge className="bg-green-500">Highly Relevant</Badge>;
    if (relevance >= 60) return <Badge className="bg-blue-500">Relevant</Badge>;
    return <Badge variant="outline">Related</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">AI-Powered Search</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Ask questions naturally - our AI understands what you're looking for
          </p>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="e.g., 'my gift code isn't working' or 'can't add more pets'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
                disabled={isSearching}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !query.trim()}
              className="shrink-0"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && searchResults && (
        <div className="space-y-4">
          {searchResults.interpreted_intent && (
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Understanding:</span> {searchResults.interpreted_intent}
              </p>
            </div>
          )}

          {searchResults.results.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-2">No results found</p>
                <p className="text-sm text-muted-foreground">
                  Try rephrasing your question or browse the FAQs below
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Found {searchResults.results.length} result{searchResults.results.length !== 1 ? 's' : ''}
              </h4>
              {searchResults.results.map((result, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{result.title}</h4>
                          {getRelevanceBadge(result.relevance)}
                        </div>
                        <p className="text-sm text-primary/70 mb-2">
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          {result.reason}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {result.content}
                    </p>
                    {result.type === "troubleshooting" && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => {
                          // Scroll to troubleshooting section
                          const wizardsSection = document.getElementById('troubleshooting-wizards');
                          if (wizardsSection) {
                            wizardsSection.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      >
                        Open Troubleshooting Wizard
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {hasSearched && !searchResults && !isSearching && (
        <Card className="border-destructive/50">
          <CardContent className="py-8 text-center">
            <p className="text-destructive mb-2">Search failed</p>
            <p className="text-sm text-muted-foreground">
              Please try again or browse the FAQs below
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
