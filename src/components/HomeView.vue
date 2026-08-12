<template>
  <section class="home-page">
    <div class="modules">
      <div class="modules-tabs">
        <button
          v-for="category in categories"
          :key="category.id"
          class="module-tab"
          :class="{ active: selectedCategory?.id === category.id }"
          @click="selectedCategory = category"
        >
          {{ category.label }}
        </button>
      </div>

      <div v-for="(section, index) in visibleSections" :key="index" class="menu-section">
        <h3 v-if="section.title" class="menu-section-title">
          <component :is="section.icon" :size="14" />
          {{ section.title }}
        </h3>

        <!-- Cards -->
        <div v-if="section.type === 'cards'" class="menu-grid">
          <RouterLink v-for="item in section.cards" :key="item.route" :to="item.route" class="menu-card">
            <div class="menu-card__header">
              <span>
                <component :is="item.icon" :size="24" />
              </span>

              <h3>{{ item.label }}</h3>
              <p>{{ item.description }}</p>
            </div>
          </RouterLink>
        </div>

        <!-- Badges -->
        <div v-else-if="section.type === 'badges'" class="menu-badges">
          <RouterLink v-for="item in section.cards" :key="item.route" :to="item.route" class="menu-badge">
            <component :is="item.icon" :size="14" />
            {{ item.label }}
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RoutePaths } from '@/router/routes';
import { LayoutDashboard } from 'lucide-vue-next';
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

interface MenuItem {
  label: string;
  description?: string;
  icon: typeof LayoutDashboard;
  route: string;
}

interface MenuSection {
  type: 'cards' | 'badges';
  title?: string;
  icon?: typeof LayoutDashboard;
  cards: MenuItem[];
}

interface Category {
  id: string;
  label: string;
  sections: MenuSection[];
}

const route = useRoute();
const selectedCategory = ref<Category | null>(null);

const categories = computed<Category[]>(() => [
  {
    id: 'projects',
    label: 'PROJETOS',
    sections: [
      {
        type: 'cards',
        cards: [
          {
            label: 'Projetos',
            description: 'Gerir projetos',
            icon: LayoutDashboard,
            route: RoutePaths.projects.list,
          },
        ],
      },
    ],
  },
  {
    id: 'configs',
    label: 'CONFIGS',
    sections: [
      {
        type: 'cards',
        cards: [
          {
            label: 'Especialidades',
            description: 'Gerir especialidades e sub-especialidades',
            icon: LayoutDashboard,
            route: RoutePaths.configs.workCategories,
          },
        ],
      },
    ],
  },
]);

watch(
  [categories, () => route.query.tab],
  () => {
    const tabParam = route.query.tab as string;
    const category = categories.value.find((c) => c.id === tabParam);
    selectedCategory.value = category || categories.value[0];
  },
  { immediate: true },
);

const visibleSections = computed<MenuSection[]>(() => selectedCategory.value?.sections || []);
</script>

<style>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/************************************************************************************************************ MODULES */

.modules {
  background: var(--color-background);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-card);

  h2 {
    margin: 0 0 8px;
    font-size: 28px;
    color: var(--color-text);
  }

  p {
    margin: 0;
    color: var(--color-text-muted);
    line-height: 1.6;
  }
}

.modules-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--color-border-light);
}

.module-tab {
  padding: 12px 20px;
  border: none;
  background: transparent;
  cursor: pointer;

  font-weight: 600;
  color: var(--color-text-muted);

  border-bottom: 3px solid transparent;
  transition: 0.2s;

  &:hover {
    color: var(--color-primary);
  }

  &.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
  }
}

/************************************************************************************************************** MENUS */

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.menu-section {
  &:not(:last-child) {
    margin-bottom: 36px;
  }
}

.menu-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 36px 0 20px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 14px;

  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);

  border-left: 4px solid var(--color-primary);
}

.menu-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 24px;
  background: var(--color-background);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s;
  align-items: flex-start;
  text-decoration: none;
  color: inherit;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-hover);
  }
}

.menu-card__header {
  display: grid;
  grid-template-columns: 52px 1fr;
  grid-template-rows: auto auto;
  column-gap: 16px;
  row-gap: 4px;
  align-items: center;

  h3 {
    grid-column: 2;
    color: var(--color-text);
    font-size: 18px;
    text-align: left;
    justify-self: start;
  }

  p {
    grid-column: 2;
    color: var(--color-text-muted);
    text-align: left;
    justify-self: start;
  }

  span {
    grid-row: 1 / span 2;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary-light);
    color: var(--color-primary);
    border-radius: 10px;
  }
}

.menu-badges {
  display: flex;
  flex-wrap: wrap;

  gap: 12px;
  padding-left: 14px;
}

.menu-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 12px;

  background: var(--color-primary-light);
  color: var(--color-primary);

  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;

  transition: 0.2s;

  &:hover {
    background: var(--color-primary);
    color: white;
  }
}
</style>
