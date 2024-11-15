<template>
  <Listbox v-model="selectedValue">
    <div class="relative mt-1">
      <ListboxButton
        class="relative w-full cursor-default rounded-xl bg-surface py-2 pl-3 pr-10 text-left ring-2 ring-surfaceAlt2/10 focus:outline-none focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-secondary/75 focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:text-sm active:bg-surfaceAlt">
        <span class="block truncate">{{ selectedValue.label }}</span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <PhCaretUpDown :size="20" class="text-uiText/50" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <ListboxOptions
          class="absolute mt-1 bottom-12 max-h-60 w-full overflow-auto rounded-xl bg-surfaceAlt/90 backdrop-blur py-1 text-base shadow-lg ring-1 ring-surfaceAlt2/10 focus:outline-none sm:text-sm">
          <ListboxOption v-slot="{ active, selected }" v-for="item in props.items" :key="item.value" :value="item" as="template">
            <li :class="[
              active ? 'bg-secondary/10 text-uiText/90' : 'text-uiText/80',
              'relative cursor-default select-none py-2 pl-10 pr-4',
            ]">
              <span :class="[
                selected ? 'font-medium' : 'font-normal',
                'block truncate',
              ]">{{ item.label }}</span>
              <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-secondaryAlt">
                <PhCheck :size="20" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

<script setup>
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'
import { PhCaretUpDown, PhCheck } from '@phosphor-icons/vue';


const selectedValue = defineModel('selected');
const props = defineProps(['items']);
</script>