<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '~/composables/useApi';
import type { UserResponse } from '~/schemas/user.schema';

const props = defineProps<{
  selectedUserId?: number;
}>();

const emit = defineEmits<{
  userDeleted: [];
  userSelected: [user: UserResponse];
}>();

const api = useApi();
const users = ref<UserResponse[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const fetchUsers = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    users.value = await api.users.getAll();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch users';
  } finally {
    isLoading.value = false;
  }
};

const deleteUser = async (id: number) => {
  if (!confirm('Are you sure you want to delete this user?')) return;

  try {
    await api.users.delete(id);
    emit('userDeleted');
    fetchUsers();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete user';
  }
};

const selectUser = (user: UserResponse) => {
  emit('userSelected', user);
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  fetchUsers();
});

// Expose fetchUsers for parent components
defineExpose({
  fetchUsers,
});
</script>

<template>
  <div class="rounded-xl bg-white p-6 shadow-lg">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-semibold text-gray-800">Users List</h2>
      <button @click="fetchUsers" class="btn-secondary text-sm" :disabled="isLoading">
        {{ isLoading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <div v-if="isLoading" class="py-8 text-center">
      <div
        class="border-primary-600 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"
      ></div>
      <p class="mt-2 text-gray-600">Loading users...</p>
    </div>

    <div v-else-if="users.length === 0" class="py-8 text-center">
      <p class="text-gray-500">No users found. Create one to get started!</p>
    </div>

    <div v-else class="max-h-[600px] space-y-4 overflow-y-auto">
      <div
        v-for="user in users"
        :key="user.id"
        @click="selectUser(user)"
        class="cursor-pointer rounded-lg border p-4 transition-all"
        :class="
          selectedUserId === user.id
            ? 'border-primary-500 bg-primary-50 shadow-md'
            : 'hover:border-primary-300 border-gray-200 bg-gray-50 hover:shadow-md'
        "
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900">{{ user.name }} {{ user.surname }}</h3>
            <div class="mt-2 space-y-1 text-sm text-gray-600">
              <p>
                <span class="font-medium">Gender:</span>
                <span class="ml-2 capitalize">{{ user.gender }}</span>
              </p>
              <p>
                <span class="font-medium">Trusted:</span>
                <span
                  class="ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                  :class="
                    user.isTrusted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  "
                >
                  {{ user.isTrusted ? 'Yes' : 'No' }}
                </span>
              </p>

              <p v-if="user.updatedAt !== user.createdAt" class="text-xs text-gray-500">
                Updated: {{ formatDate(user.updatedAt) }}
              </p>
              <p v-else class="text-xs text-gray-500">
                Created: {{ formatDate(user.createdAt) }}
              </p>
            </div>
          </div>
          <button
            @click.stop="deleteUser(user.id)"
            class="ml-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
