<template>
  <div class="main-section">
    <div class="section">
      <div v-if="apiStatus.isLoading" class="loading-overlay">
        <div>
          <LoaderCircle :size="18" class="spinner" />
          A carregar projeto...
        </div>
      </div>

      <div v-if="project" class="section-body">
        <div class="project-navigation">
          <div class="project-tabs">
            <button
              v-for="tab in projectTabs"
              :key="tab.id"
              type="button"
              class="project-tab"
              :class="{ active: selectedTab === tab.id }"
              @click="selectTab(tab.id)"
            >
              {{ tab.label }}
            </button>
          </div>

          <RouterLink :to="RoutePaths.projects.list" class="link project-back-link">
            Voltar para Lista de Projetos
          </RouterLink>
        </div>

        <div class="project-view">
          <ProjectCoverView
            v-if="selectedTab === 'cover'"
            :key="projectRefreshKey"
            v-model="project"
            :has-unsaved-changes="hasUnsavedChanges"
            :changed-fields="changedFields"
            @reload="getProject(projectId)"
            @saved="markProjectSaved"
          />
          <QuantityMapView
            v-if="selectedTab === 'quantity-map'"
            :key="projectRefreshKey"
            v-model="project"
            :has-unsaved-changes="hasUnsavedChanges"
            :changed-fields="changedFields"
            :expanded-category-ids="expandedQuantityMapCategoryIds"
            @reload="getProject(projectId)"
            @saved="markProjectSaved"
            @update:expanded-category-ids="updateQuantityMapExpansion"
          />
          <ClientBudget
            v-if="selectedTab === 'client-budget'"
            :key="projectRefreshKey"
            v-model="project"
            :expanded-category-ids="expandedClientBudgetCategoryIds"
            @reload="getProject(projectId)"
            @update:expanded-category-ids="updateClientBudgetExpansion"
          />
        </div>

        <Toast
          v-if="apiStatus.message"
          :message="apiStatus.message"
          :type="apiStatus.isSuccess ? 'success' : 'error'"
        />
      </div>
    </div>
  </div>

  <!-- unsaved changes dialog -->
  <ConfirmDialog
    v-model="showDiscardChangesDialog"
    title="Sair sem guardar?"
    :message="['Existem alterações por guardar.', 'Deseja sair sem guardar (todas as alterações serão perdidas)?']"
    confirm-text="Sair sem guardar"
    cancel-text="Cancelar"
    @confirm="discardChangesAndContinue"
    @update:model-value="handleDiscardDialogChange"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { ApiResponseStatus } from '@/types/api-response-status';
import { LoaderCircle } from 'lucide-vue-next';
import Toast from '@/components/Toast.vue';
import { apiError } from '@/services/api.ts';
import projectApi from '@/services/project-api.ts';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import { RoutePaths } from '@/router/routes.ts';
import { ProjectType } from '@/entities/project';
import { UUID } from 'node:crypto';
import ProjectCoverView from './ProjectCoverView.vue';
import QuantityMapView from './QuantityMapView.vue';
import ClientBudget from './ClientBudget.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import { useProjectHeader } from '@/composables/useProjectHeader';

const route = useRoute();
const router = useRouter();

const projectId = route.params.id as UUID;
const apiStatus = ref<ApiResponseStatus>({ isLoading: false, isSuccess: false, isError: false });

const project = ref<ProjectType | null>(null);
const projectRefreshKey = ref(0);
const initialProjectSnapshot = ref('');
const expandedQuantityMapCategoryIds = ref<string[]>([]);
const hasInitializedQuantityMapExpansion = ref(false);
const expandedClientBudgetCategoryIds = ref<string[]>([]);
const hasInitializedClientBudgetExpansion = ref(false);
const showDiscardChangesDialog = ref(false);
const pendingNavigation = ref<((value?: unknown) => void) | null>(null);
const { projectHeader, resetProjectHeader } = useProjectHeader();

function updateQuantityMapExpansion(expandedCategoryIds: string[]) {
  expandedQuantityMapCategoryIds.value = [...expandedCategoryIds];
  sessionStorage.setItem(`quantity-map-expansion:${projectId}`, JSON.stringify(expandedQuantityMapCategoryIds.value));
}

function updateClientBudgetExpansion(expandedCategoryIds: string[]) {
  expandedClientBudgetCategoryIds.value = [...expandedCategoryIds];
  sessionStorage.setItem(`client-budget-expansion:${projectId}`, JSON.stringify(expandedCategoryIds));
}

function sanitizeProjectForComparison(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeProjectForComparison(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !key.startsWith('_'))
        .map(([key, item]) => [key, sanitizeProjectForComparison(item)]),
    );
  }

  return value;
}

function getProjectSnapshot(projectValue: ProjectType | null) {
  return JSON.stringify(sanitizeProjectForComparison(projectValue ?? null));
}

function getChangedFields(currentValue: unknown, initialValue: unknown, path = '', fields = new Set<string>()) {
  if (JSON.stringify(currentValue) === JSON.stringify(initialValue)) {
    return fields;
  }

  if (Array.isArray(currentValue) && Array.isArray(initialValue)) {
    const length = Math.max(currentValue.length, initialValue.length);
    for (let index = 0; index < length; index++) {
      getChangedFields(currentValue[index], initialValue[index], `${path}[${index}]`, fields);
    }
    return fields;
  }

  if (currentValue && typeof currentValue === 'object' && initialValue && typeof initialValue === 'object') {
    const keys = new Set([...Object.keys(currentValue), ...Object.keys(initialValue)]);
    keys.forEach((key) => {
      getChangedFields(
        (currentValue as Record<string, unknown>)[key],
        (initialValue as Record<string, unknown>)[key],
        path ? `${path}.${key}` : key,
        fields,
      );
    });
    return fields;
  }

  if (path) {
    fields.add(path);
  }

  return fields;
}

const changedFields = computed(() => {
  if (!project.value || !initialProjectSnapshot.value) {
    return new Set<string>();
  }

  return getChangedFields(project.value, JSON.parse(initialProjectSnapshot.value));
});

const hasUnsavedChanges = computed(() => {
  if (!project.value) {
    return false;
  }

  return getProjectSnapshot(project.value) !== initialProjectSnapshot.value;
});

function handleDiscardDialogChange(value: boolean) {
  if (!value) {
    pendingNavigation.value = null;
    showDiscardChangesDialog.value = false;
  }
}

function discardChangesAndContinue() {
  if (project.value && initialProjectSnapshot.value) {
    project.value = JSON.parse(initialProjectSnapshot.value) as ProjectType;
  }

  showDiscardChangesDialog.value = false;

  const next = pendingNavigation.value;
  pendingNavigation.value = null;
  next?.();
}

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!hasUnsavedChanges.value) {
    return;
  }

  event.preventDefault();
  event.returnValue = '';
};

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
  resetProjectHeader();
});

onBeforeRouteLeave((_to, _from, next) => {
  if (!hasUnsavedChanges.value) {
    next();
    return;
  }

  pendingNavigation.value = next;
  showDiscardChangesDialog.value = true;
});

/**************************************************************************************************************** TABS*/

type ProjectTab = 'cover' | 'general-parameters' | 'calculations' | 'quantity-map' | 'client-budget';

const projectTabs: {
  id: ProjectTab;
  label: string;
}[] = [
  {
    id: 'cover',
    label: 'CAPA',
  },
  {
    id: 'quantity-map',
    label: 'MAPA DE QUANTIDADES',
  },
  {
    id: 'client-budget',
    label: 'ORÇAMENTO CLIENTE',
  },
];

const selectedTab = ref<ProjectTab>((route.query.tab as ProjectTab) ?? 'cover');

function selectTab(tab: ProjectTab) {
  if (selectedTab.value === tab) {
    return;
  }

  if (!hasUnsavedChanges.value) {
    selectedTab.value = tab;

    router.replace({
      query: {
        ...route.query,
        tab,
      },
    });

    return;
  }

  pendingNavigation.value = () => {
    selectedTab.value = tab;

    void router.replace({
      query: {
        ...route.query,
        tab,
      },
    });
  };

  showDiscardChangesDialog.value = true;
}

/*************************************************************************************************************** LOAD */

void getProject(projectId);

function markProjectSaved() {
  initialProjectSnapshot.value = getProjectSnapshot(project.value ?? null);
}

async function getProject(projectId: UUID) {
  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    project.value = await projectApi.getProject(projectId);
    projectHeader.value = `${project.value.description ?? ''} • ${project.value.client ?? ''}`;

    if (!hasInitializedQuantityMapExpansion.value) {
      const storedExpansion = sessionStorage.getItem(`quantity-map-expansion:${projectId}`);
      const storedCategoryIds = storedExpansion ? (JSON.parse(storedExpansion) as string[]) : null;

      expandedQuantityMapCategoryIds.value =
        storedCategoryIds ??
        (project.value.workCategories ?? [])
          .filter((category) => category.isIncluded && category.workCategoryId)
          .map((category) => category.workCategoryId!);
      hasInitializedQuantityMapExpansion.value = true;
    }

    if (!hasInitializedClientBudgetExpansion.value) {
      const storedExpansion = sessionStorage.getItem(`client-budget-expansion:${projectId}`);
      const storedCategoryIds = storedExpansion ? (JSON.parse(storedExpansion) as string[]) : null;

      expandedClientBudgetCategoryIds.value =
        storedCategoryIds ??
        (project.value.workCategories ?? [])
          .filter((category) => category.isIncluded && category.workCategoryId)
          .map((category) => category.workCategoryId!);
      hasInitializedClientBudgetExpansion.value = true;
    }

    initialProjectSnapshot.value = getProjectSnapshot(project.value ?? null);

    projectRefreshKey.value++;

    apiStatus.value = { isLoading: false, isSuccess: true, isError: false };
  } catch (error: unknown) {
    apiStatus.value = apiError(error, 'Não foi possível carregar o projecto.');
  }
}
</script>
<style lang="scss">
.project-navigation {
  display: flex;
  align-items: center;
  min-width: 0;
  height: 28px;
  border-bottom: 1px solid var(--color-border-light);
}

.project-tabs {
  display: flex;
  align-self: stretch;
  gap: 2px;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
}

.project-back-link {
  flex-shrink: 0;
  padding: 2px 8px;

  white-space: nowrap;
}

.project-tab {
  padding: 2px 14px;
  border: none;
  border-radius: 4px 4px 0 0;
  background: transparent;
  cursor: pointer;

  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  line-height: 1.2;
  white-space: nowrap;

  border-bottom: 2px solid transparent;
  transition: 0.2s;

  &:hover {
    color: var(--color-primary);
    background: var(--color-primary-light);
  }

  &.active {
    color: var(--color-primary);
    background: var(--color-primary-light);
    border-bottom-color: var(--color-primary);
  }
}

.project-view {
  display: flex;
  flex-direction: column;

  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
