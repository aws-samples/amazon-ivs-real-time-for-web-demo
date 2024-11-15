<template>
  <SwitchGroup>
    <div class="flex gap-x-2 items-center">
      <SwitchLabel class="flex grow items-start text-sm text-uiTextAlt2">
        {{ props.label }}
      </SwitchLabel>
      <Switch v-model="enabled" :class="enabled ? 'bg-secondary' : 'bg-neutral'"
        class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
        <!-- Transition the switch's knob on state change -->
        <span aria-hidden="true" :class="enabled ? 'translate-x-[22px]' : 'translate-x-0.5'"
          class="relative top-0.5 pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out" />
      </Switch>
    </div>
  </SwitchGroup>
</template>

<script setup>
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue'

const enabled = defineModel();
const props = defineProps({
  label: String
})
</script>