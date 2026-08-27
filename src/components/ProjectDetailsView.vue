<template>
  <div class="main-section">
    <div class="section-header">
      <span><FileInput :size="24" /></span>
      <h3>{{ project?.description! }}</h3>

      <div class="page-nav">
        <RouterLink :to="RoutePaths.projects.list" class="link">Voltar para Lista de Projetos</RouterLink>
      </div>
    </div>

    <div class="section">
      <div v-if="apiStatus.isLoading" class="loading-overlay">
        <div>
          <LoaderCircle :size="18" class="spinner" />
          A carregar projeto...
        </div>
      </div>

      <div v-if="project" class="section-body">
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

        <div class="project-view">
          <ProjectCoverView
            v-if="selectedTab === 'cover'"
            :key="projectRefreshKey"
            v-model="project"
            @reload="getProject(projectId)"
          />
          <QuantityMap
            v-if="selectedTab === 'quantity-map'"
            :key="projectRefreshKey"
            v-model="project"
            @reload="getProject(projectId)"
          />
          <ClientBudget
            v-if="selectedTab === 'client-budget'"
            :key="projectRefreshKey"
            v-model="project"
            @reload="getProject(projectId)"
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
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ApiResponseStatus } from '@/types/api-response-status';
import { FileInput, LoaderCircle } from 'lucide-vue-next';
import Toast from '@/components/Toast.vue';
import { apiError } from '@/services/api.ts';
import projectApi from '@/services/project-api.ts';
import { useRoute, useRouter } from 'vue-router';
import { RoutePaths } from '@/router/routes.ts';
import { ProjectType } from '@/entities/project';
import { UUID } from 'node:crypto';
import ProjectCoverView from './ProjectCoverView.vue';
import QuantityMap from './QuantityMap.vue';
import ClientBudget from './ClientBudget.vue';

const route = useRoute();
const router = useRouter();

const projectId = route.params.id as UUID;
const apiStatus = ref<ApiResponseStatus>({ isLoading: false, isSuccess: false, isError: false });

const project = ref<ProjectType | null>(null);
const projectRefreshKey = ref(0);

onUnmounted(() => {});

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
  selectedTab.value = tab;

  router.replace({
    query: {
      ...route.query,
      tab,
    },
  });
}

/*************************************************************************************************************** LOAD */

onMounted(async () => {
  await getProject(projectId);
});

async function getProject(projectId: UUID) {
  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    project.value = await projectApi.getProject(projectId);

    projectRefreshKey.value++;

    apiStatus.value = { isLoading: false, isSuccess: true, isError: false };
  } catch (error: unknown) {
    apiStatus.value = apiError(error, 'Não foi possível carregar o projecto.');
  }
}
</script>
<style lang="scss">
.project-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
  border-bottom: 1px solid var(--color-border-light);
}

.project-tab {
  padding: 5px 20px;
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

.project-view {
  display: flex;
  flex-direction: column;

  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
