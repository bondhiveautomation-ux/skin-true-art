import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string | null;
  category: string;
  read_time: string | null;
  icon: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArticleInsert {
  title: string;
  excerpt: string;
  content?: string;
  category?: string;
  read_time?: string;
  icon?: string;
  display_order?: number;
  is_published?: boolean;
}

export const useArticles = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async (publishedOnly = false) => {
    try {
      setLoading(true);
      let query = supabase
        .from("articles")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (publishedOnly) {
        query = query.eq("is_published", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setArticles((data || []) as Article[]);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createArticle = async (article: ArticleInsert): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("articles")
        .insert(article as never);

      if (error) throw error;
      
      toast({ title: "Article created", description: "The article has been created successfully." });
      await fetchArticles();
      return true;
    } catch (error) {
      console.error("Error creating article:", error);
      toast({ title: "Error", description: "Failed to create article.", variant: "destructive" });
      return false;
    }
  };

  const updateArticle = async (id: string, updates: Partial<ArticleInsert>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("articles")
        .update(updates as never)
        .eq("id", id);

      if (error) throw error;
      
      toast({ title: "Article updated", description: "The article has been updated successfully." });
      await fetchArticles();
      return true;
    } catch (error) {
      console.error("Error updating article:", error);
      toast({ title: "Error", description: "Failed to update article.", variant: "destructive" });
      return false;
    }
  };

  const deleteArticle = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({ title: "Article deleted", description: "The article has been deleted." });
      await fetchArticles();
      return true;
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({ title: "Error", description: "Failed to delete article.", variant: "destructive" });
      return false;
    }
  };

  const togglePublished = async (id: string, isPublished: boolean): Promise<boolean> => {
    return updateArticle(id, { is_published: !isPublished });
  };

  return {
    articles,
    loading,
    fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    togglePublished,
  };
};
