<template>
  <div>
    <div v-if="apiStatus.isLoading" class="loading-overlay">
      <div>
        <LoaderCircle :size="18" class="spinner" />
        A carregar projeto...
      </div>
    </div>

    <div class="forms-container">
      <div class="form-section">
        <h3>Dados da Obra</h3>

        <div class="form-grid">
          <div class="form-group">
            <label>{{ projectConfigs.description.label }}</label>
            <TextInput
              :value="project.description"
              :is-invalid="!project.description"
              :is-disabled="false"
              @update:value="project.description = $event"
            />
          </div>

          <div class="form-group">
            <label>{{ projectConfigs.address.label }}</label>
            <TextInput
              :value="project.address"
              :is-invalid="!project.address"
              :is-disabled="false"
              @update:value="project.address = $event"
            />
          </div>

          <div class="form-group">
            <label>{{ projectConfigs.client.label }}</label>
            <TextInput
              :value="project.client"
              :is-invalid="!project.client"
              :is-disabled="false"
              @update:value="project.client = $event"
            />
          </div>

          <div class="form-group">
            <label>{{ projectConfigs.contact.label }}</label>
            <TextInput
              :value="project.contact"
              :is-invalid="false"
              :is-disabled="false"
              @update:value="project.contact = $event"
            />
          </div>

          <div class="form-group">
            <label>{{ projectConfigs.landArea.label }}</label>
            <NumberInput
              :entity="projectEntity"
              :value="project.landArea"
              field-key="landArea"
              :is-invalid="!project.landArea"
              :is-disabled="false"
              @update:value="project.landArea = $event"
            />
          </div>

          <div class="form-group">
            <label>{{ projectConfigs.implantationArea.label }}</label>
            <NumberInput
              :entity="projectEntity"
              :value="project.implantationArea"
              field-key="implantationArea"
              :is-invalid="!project.implantationArea"
              :is-disabled="false"
              @update:value="project.implantationArea = $event"
            />
          </div>

          <div class="form-group">
            <label>{{ projectConfigs.grossConstructionArea.label }}</label>
            <NumberInput
              :entity="projectEntity"
              :value="project.grossConstructionArea"
              field-key="grossConstructionArea"
              :is-invalid="!project.grossConstructionArea"
              :is-disabled="false"
              @update:value="project.grossConstructionArea = $event"
            />
          </div>

          <div class="form-group">
            <label>{{ projectConfigs.floorsCount.label }}</label>
            <IntInput
              :entity="projectEntity"
              :value="project.floorsCount"
              field-key="floorsCount"
              :is-invalid="!project.floorsCount"
              :is-disabled="false"
              @update:value="project.floorsCount = $event"
            />
          </div>

          <div class="form-group">
            <label>{{ projectConfigs.ceilingHeight.label }}</label>
            <NumberInput
              :entity="projectEntity"
              :value="project.ceilingHeight"
              field-key="ceilingHeight"
              :is-invalid="!project.ceilingHeight"
              :is-disabled="false"
              @update:value="project.ceilingHeight = $event"
            />
          </div>

          <div class="form-group">
            <label>{{ projectConfigs.maxFacadeHeight.label }}</label>
            <NumberInput
              :entity="projectEntity"
              :value="project.maxFacadeHeight"
              field-key="maxFacadeHeight"
              :is-invalid="!project.maxFacadeHeight"
              :is-disabled="false"
              @update:value="project.maxFacadeHeight = $event"
            />
          </div>

          <div class="form-group">
            <label>{{ projectConfigs.roomsCount.label }}</label>
            <IntInput
              :entity="projectEntity"
              :value="project.roomsCount"
              field-key="roomsCount"
              :is-invalid="!project.roomsCount"
              :is-disabled="false"
              @update:value="project.roomsCount = $event"
            />
          </div>

          <div class="form-group">
            <label>{{ projectConfigs.wcCount.label }}</label>
            <IntInput
              :entity="projectEntity"
              :value="project.wcCount"
              field-key="wcCount"
              :is-invalid="!project.wcCount"
              :is-disabled="false"
              @update:value="project.wcCount = $event"
            />
          </div>

          <div class="form-group">
            <label>{{ projectConfigs.isActive.label }}</label>
            <CheckBox
              :value="project.isActive"
              :is-invalid="false"
              :is-disabled="false"
              @update:value="project.isActive = $event"
            />
          </div>
        </div>
      </div>

      <section class="form-section">
        <h3>Desagregação por Especialidades</h3>

        <ProjectWorkCategoriesForm v-if="project.workCategories" v-model="project.workCategories" />
      </section>
    </div>

    <div class="form-actions">
      <button type="button" class="btn" @click="goToProjectsList">
        <Delete :size="18" />
        Lista de Projetos
      </button>

      <button type="button" class="btn btn-danger" @click="askDelete">
        <Trash2 :size="18" />
        Apagar Projeto
      </button>

      <button type="button" class="btn" :disabled="apiStatus.isLoading" @click="saveProject">
        <Save :size="18" />
        Guardar Alterações
      </button>
    </div>
  </div>

  <Toast v-if="apiStatus.message" :message="apiStatus.message" :type="apiStatus.isSuccess ? 'success' : 'error'" />

  <ConfirmDialog
    v-model="showDeleteDialog"
    title="Eliminar projeto"
    :message="[
      `${project.description} | ${project.client}`,
      'Tem a certeza que quer eliminar definitivamente este projeto?',
    ]"
    confirm-text="Apagar"
    cancel-text="Cancelar"
    @confirm="confirmDelete"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Delete, LoaderCircle, Save, Trash2 } from 'lucide-vue-next';
import { ApiResponseStatus } from '@/types/api-response-status';
import { apiError } from '@/services/api.ts';
import projectApi from '@/services/project-api.ts';
import router from '@/router';
import { RouteNames } from '@/router/routes.ts';
import { Project, ProjectType } from '@/entities/project';
import Toast from '@/components/Toast.vue';
import TextInput from './inputs/TextInput.vue';
import NumberInput from './inputs/NumberInput.vue';
import IntInput from './inputs/IntInput.vue';
import CheckBox from './inputs/CheckBox.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import ProjectWorkCategoriesForm from './ProjectWorkCategoriesForm.vue';

const project = defineModel<ProjectType>({ required: true });
const projectConfigs = computed(() => Project.getConfigs());
const projectEntity = computed(() => project.value as Record<string, unknown>);

const apiStatus = ref<ApiResponseStatus>({ isLoading: false, isSuccess: false, isError: false });

const emit = defineEmits<{
  reload: [];
}>();

/*************************************************************************************************************** SAVE */

async function saveProject() {
  if (!project.value.id) {
    return;
  }

  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    await projectApi.updateProject(project.value.id, project.value);

    emit('reload');

    apiStatus.value = { isLoading: false, isSuccess: true, isError: false, message: 'Projeto guardado com sucesso.' };
  } catch (error: unknown) {
    apiStatus.value = apiError(error, 'Não foi possível guardar o projeto.');
  }
}

/************************************************************************************************************* DELETE */

const showDeleteDialog = ref(false);

function askDelete() {
  showDeleteDialog.value = true;
}

async function confirmDelete(): Promise<void> {
  if (!project.value.id) {
    return;
  }

  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    await projectApi.deleteProject(project.value.id);

    apiStatus.value = { isLoading: false, isSuccess: true, isError: false, message: 'Projeto eliminado com sucesso.' };

    showDeleteDialog.value = false;
    goToProjectsList();
  } catch (error: unknown) {
    apiStatus.value = apiError(error, 'Erro ao eliminar o projeto.');
  }
}

/************************************************************************************************************* NAVIGATION */

function goToProjectsList() {
  router.push({ name: RouteNames.projectsList });
}
</script>

<style lang="scss"></style>
