import configsApi from '@/services/configs-api';
import { TypeEnum } from '@/types/type-enum';
import { ref } from 'vue';

const typeOptions = ref<Record<string, TypeEnum>>({});

const loaded = ref(false);

export async function loadConfigs() {
  if (loaded.value) return;

  const typeValues = await configsApi.getTypeValues();
  typeOptions.value = Object.fromEntries(typeValues.map((e) => [e.code, e]));

  loaded.value = true;
}

export function useConfigs() {
  return {
    typeOptions,
    loadConfigs,
  };
}
