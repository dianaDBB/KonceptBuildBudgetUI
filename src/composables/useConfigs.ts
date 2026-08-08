import { ref } from 'vue';

const loaded = ref(false);

export async function loadConfigs() {
  if (loaded.value) return;

  loaded.value = true;
}

export function useConfigs() {
  return {
    loadConfigs,
  };
}
