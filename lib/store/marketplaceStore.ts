import { create } from 'zustand';
import { CategoryItem } from '@/types';
import { POPULAR_CATEGORIES } from '@/lib/constants/categories';

interface MarketplaceState {
  categories: CategoryItem[];
  selectedCategorySlug: string | null;
  searchQuery: string;
  filteredCategories: CategoryItem[];
  setSelectedCategory: (slug: string | null) => void;
  setSearchQuery: (query: string) => void;
  getCategoryBySlug: (slug: string) => CategoryItem | undefined;
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  categories: POPULAR_CATEGORIES,
  selectedCategorySlug: null,
  searchQuery: '',
  filteredCategories: POPULAR_CATEGORIES,

  setSelectedCategory: (slug) => {
    set({ selectedCategorySlug: slug });
  },

  setSearchQuery: (query) => {
    const trimmed = query.toLowerCase().trim();
    if (!trimmed) {
      set({ searchQuery: query, filteredCategories: get().categories });
      return;
    }

    const filtered = get().categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(trimmed) ||
        cat.description.toLowerCase().includes(trimmed)
    );
    set({ searchQuery: query, filteredCategories: filtered });
  },

  getCategoryBySlug: (slug) => {
    return get().categories.find((c) => c.slug === slug);
  },
}));
