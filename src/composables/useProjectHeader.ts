import { ref } from 'vue';

const defaultProjectHeader = 'KonceptBuild Budget';
const projectHeader = ref(defaultProjectHeader);

export function useProjectHeader() {
  function resetProjectHeader() {
    projectHeader.value = defaultProjectHeader;
  }

  return {
    projectHeader,
    resetProjectHeader,
  };
}
