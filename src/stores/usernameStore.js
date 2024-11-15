import { defineStore } from 'pinia';
import FRUITS from '../constants/fruits';

const generateUsername = (dict = FRUITS) => {
  const len = dict.length;
  const word1 = dict[Math.floor(Math.random() * len)];
  const word2 = dict[Math.floor(Math.random() * len)];
  const number = Math.floor(Math.random() * 10);
  return `${word1}${word2}${number}`;
};

const generateUserId = () => {
  return Math.random().toString(36).slice(2);
};

export const useUsernameStore = defineStore('username', {
  state: () => ({
    username: '',
    userId: '',
  }),
  actions: {
    regenerateUsername(forceUpdate) {
      if (this.username !== '' && !forceUpdate) return;
      this.username = generateUsername();
    },
    regenerateUserId(forceUpdate) {
      if (this.userId !== '' && !forceUpdate) return;
      this.userId = generateUserId();
    },
    init() {
      this.regenerateUsername();
      this.regenerateUserId();
    },
  },
  persist: true,
});
