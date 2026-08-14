<template>
  <div class="main-section">
    <div class="section-header">
      <span><FileInput :size="24" /></span>
      <h3>Projetos</h3>
    </div>

    <div class="section">
      <div v-if="apiStatus.isLoading" class="loading-overlay">
        <div>
          <LoaderCircle :size="18" class="spinner" />
          A carregar projetos...
        </div>
      </div>
      <div class="section-body">
        <div class="table">
          <table>
            <colgroup>
              <col
                v-for="config in Object.values(projectConfigs)"
                :key="config.label"
                :style="config.styleConfig.columnStyle"
              />
            </colgroup>
            <thead>
              <tr>
                <th v-for="[_fieldKey, config] in Object.entries(projectConfigs)" :key="config.label">
                  <div :class="['column-heading', config.styleConfig.headerClasses]">
                    {{ config.label }}
                  </div>
                </th>
              </tr>
            </thead>
            <EntityTableBody :rows="projectTable" />
          </table>
        </div>

        <div class="actions">
          <button class="btn" :disabled="projectTable.isEditing.value || apiStatus.isLoading" @click="addProject">
            <Plus :size="18" /> Adicionar Projeto
          </button>
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
import { ref, onMounted, computed, nextTick } from 'vue';
import { ApiResponseStatus } from '@/types/api-response-status';
import { FileInput, Plus, LoaderCircle } from 'lucide-vue-next';
import Toast from '@/components/Toast.vue';
import { EntityTableBodyProps, TableRow } from '@/types/entity-configs.ts';
import { apiError } from '@/services/api.ts';
import EntityTableBody from './EntityTableBody.vue';
import { Project, ProjectType } from '@/entities/project.ts';
import projectApi from '@/services/project-api.ts';
import router from '@/router/index.ts';
import { RouteNames } from '@/router/routes.ts';

const apiStatus = ref<ApiResponseStatus>({ isLoading: false, isSuccess: false, isError: false });
const tableBody = ref<HTMLTableSectionElement | null>(null);

const projects = ref<ProjectRow[]>([]);
const projectConfigs = computed(() => Project.getConfigs());

const isEditing = ref(false);

const projectTable = computed<EntityTableBodyProps<ProjectType>>(() => ({
  rows: projects.value,
  configs: projectConfigs.value,
  handlers: {
    click: openProject,
    save: saveProject,
    discard: discardProjectRow,
  },
  rowIsActive: () => true,
  isValid: (project) => Project.isValid(project, projectConfigs.value),
  isEditing: isEditing,
}));

interface ProjectRow extends TableRow<ProjectType> {}

let _keyCounter = 0;
function nextKey(): string {
  return `row-${++_keyCounter}`;
}

/*************************************************************************************************************** LOAD */

onMounted(async () => {
  await getProjects();
});

async function getProjects() {
  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    const gotProjects = await projectApi.getProjects();

    projects.value = gotProjects.map((project) => ({
      entity: {
        ...project,
      },
      _key: project.id ?? nextKey(),
      _isNew: false,
      _isEdited: false,
    }));

    apiStatus.value = { isLoading: false, isSuccess: true, isError: false };
  } catch (error: unknown) {
    apiStatus.value = apiError(error, 'Não foi possível carregar os projectos.');
  }
}

/******************************************************************************************************** ROW ACTIONS */

interface ProjectRow extends TableRow<ProjectType> {}

function openProject(row: ProjectRow) {
  router.push({
    name: RouteNames.projectDetails,
    params: {
      id: row.entity.id,
    },
  });
}

function discardProjectRow(row: ProjectRow) {
  if (row._isNew) {
    projects.value = projects.value.filter((w) => w._key !== row._key);
  } else {
    row.entity = row._original!;
    row._isNew = false;
    row._isEdited = false;
  }

  isEditing.value = false;
}

/**************************************************************************************************************** ADD */

async function addProject(): Promise<void> {
  isEditing.value = true;

  projects.value.push({
    entity: {
      isActive: true,
    },
    _key: nextKey(),
    _isNew: true,
    _isEdited: false,
  });

  await nextTick();

  const lastRow = tableBody.value?.querySelector('tr:last-child');
  lastRow?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
  });

  (lastRow?.querySelector('input') as HTMLInputElement)?.focus();
}

/*************************************************************************************************************** SAVE */

async function saveProject(row: ProjectRow): Promise<void> {
  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    if (row._isNew) {
      await projectApi.createProject(row.entity);
    } else if (row._isEdited) {
      await projectApi.updateProject(row.entity.id!, row.entity);
    }

    await getProjects();
    isEditing.value = false;

    apiStatus.value = {
      isLoading: false,
      isSuccess: true,
      isError: false,
      message: 'Alterações guardadas com sucesso.',
    };
  } catch (error: unknown) {
    await getProjects();
    isEditing.value = false;
    apiStatus.value = apiError(error, 'Não foi possível guardar as alterações.');
  }
}
</script>
<style lang="scss"></style>
