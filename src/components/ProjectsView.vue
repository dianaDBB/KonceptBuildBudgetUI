<template>
  <div class="main-section">
    <div class="section-header">
      <span><FileInput :size="24" /></span>
      <h3>Projetos</h3>

      <div class="page-nav">
        <RouterLink to="/" class="link"> Página Inicial </RouterLink>
      </div>
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
              <col style="width: 130px" />
              <!--actions column-->
            </colgroup>
            <thead>
              <tr>
                <th v-for="config in Object.values(projectConfigs)" :key="config.label">
                  <div class="column-heading">
                    {{ config.label }}
                  </div>
                </th>
                <th></th>
                <!--actions column-->
              </tr>
            </thead>
            <EntityTableBody :rows="projectTable" />
          </table>
        </div>

        <div class="actions">
          <button class="btn" :disabled="projectTable.isEditing.value || apiStatus.isLoading" @click="addProject">
            <Plus :size="18" /> Adicionar Especialidade
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

  <!-- delete dialog-->
  <ConfirmDialog
    v-model="showDeleteProjectDialog"
    title="Eliminar fatura / nota crédito"
    :message="[
      `${projectToDelete?.entity.description}`,
      'Tem a certeza que quer eliminar definitivamente esta especialidade?',
    ]"
    confirm-text="Apagar"
    cancel-text="Cancelar"
    @confirm="confirmProjectCategory"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { ApiResponseStatus } from '@/types/api-response-status';
import { FileInput, Plus, LoaderCircle } from 'lucide-vue-next';
import Toast from '@/components/Toast.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import { EntityTableBodyProps, TableRow } from '@/types/entity-configs.ts';
import { apiError } from '@/services/api.ts';
import EntityTableBody from './EntityTableBody.vue';
import { Project, ProjectType } from '@/entities/project.ts';
import projectApi from '@/services/project-api.ts';

const apiStatus = ref<ApiResponseStatus>({ isLoading: false, isSuccess: false, isError: false });
const tableBody = ref<HTMLTableSectionElement | null>(null);

const projects = ref<ProjectRow[]>([]);
const projectConfigs = computed(() => Project.getConfigs());

const isEditing = ref(false);

const projectTable = computed<EntityTableBodyProps<ProjectType>>(() => ({
  rows: projects.value,
  configs: projectConfigs.value,
  handlers: {
    edit: startEditingProject,
    delete: askDeleteProject,
    save: saveProject,
    discard: discardProjectRow,
  },
  rowIsActive: () => true,
  isValid: (project) => Project.isValid(project, projectConfigs.value),
  isEditing: isEditing,
}));

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

let _keyCounter = 0;
function nextKey(): string {
  return `row-${++_keyCounter}`;
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

/*************************************************************************************************************** EDIT */

function startEditingProject(row: ProjectRow) {
  isEditing.value = true;

  row._isEdited = true;
  row._original = JSON.parse(JSON.stringify(row.entity));
}

/**************************************************************************************************************** ADD */

async function addProject(): Promise<void> {
  isEditing.value = true;

  projects.value.push({
    entity: {},
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

/************************************************************************************************************* DELETE */

const showDeleteProjectDialog = ref(false);
const projectToDelete = ref<ProjectRow | null>(null);

function askDeleteProject(row: ProjectRow) {
  projectToDelete.value = row;
  showDeleteProjectDialog.value = true;
}

async function confirmProjectCategory(): Promise<void> {
  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    if (!projectToDelete.value?.entity.id) {
      return;
    }

    await projectApi.deleteProject(projectToDelete.value.entity.id);
    await getProjects();

    apiStatus.value = {
      isLoading: false,
      isSuccess: true,
      isError: false,
      message: 'Alterações guardadas com sucesso.',
    };

    showDeleteProjectDialog.value = false;
    projectToDelete.value = null;
  } catch (error: unknown) {
    await getProjects();
    apiStatus.value = apiError(error, 'Não foi possível guardar as alterações.');
  }
}
</script>
<style lang="scss"></style>
