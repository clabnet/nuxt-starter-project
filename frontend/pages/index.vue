<script setup lang="ts">
import { ref, nextTick } from 'vue';
import type { UserResponse } from '~/schemas/user.schema';

const successMessage = ref<string | null>(null);
const selectedUser = ref<UserResponse | null>(null);
const usersListRef = ref<any>(null);

const handleUserCreated = async () => {
  successMessage.value = 'User created successfully!';
  // Wait for the next tick and refresh the users list
  await nextTick();
  if (usersListRef.value && typeof usersListRef.value.fetchUsers === 'function') {
    await usersListRef.value.fetchUsers();
  }
  setTimeout(() => {
    successMessage.value = null;
  }, 3000);
};

const handleUserDeleted = () => {
  successMessage.value = 'User deleted successfully!';
  selectedUser.value = null; // Clear selection when user is deleted
  setTimeout(() => {
    successMessage.value = null;
  }, 3000);
};

const handleUserUpdated = async () => {
  successMessage.value = 'User updated successfully!';
  // Wait for the next tick and refresh the users list
  await nextTick();
  if (usersListRef.value && typeof usersListRef.value.fetchUsers === 'function') {
    await usersListRef.value.fetchUsers();
  }
  setTimeout(() => {
    successMessage.value = null;
  }, 3000);
};

const handleUserSelected = (user: UserResponse) => {
  selectedUser.value = user;
};
</script>

<template>
  <div
    class="from-primary-50 to-primary-100 min-h-screen bg-gradient-to-br px-4 py-4 sm:px-6 lg:px-8"
  >
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-gray-900">User Management</h1>
        <p class="mt-2 text-lg text-gray-600">Create and manage users with ease</p>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="mb-6 rounded-lg bg-green-50 p-4 text-green-800 shadow-sm">
        {{ successMessage }}
      </div>

      <!-- Main Grid -->
      <div class="grid gap-8 lg:grid-cols-2">
        <!-- Left: Users List -->
        <UsersList
          ref="usersListRef"
          @user-deleted="handleUserDeleted"
          @user-selected="handleUserSelected"
          :selected-user-id="selectedUser?.id"
        />

        <!-- Right: User Form (Create or Update) -->
        <div class="rounded-xl bg-white p-6 shadow-lg">
          <UserForm
            @user-created="handleUserCreated"
            @user-updated="handleUserUpdated"
            :user="selectedUser"
            :key="selectedUser?.id || 'new'"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center text-sm text-gray-600">
        <p>Built with Nuxt 3, TypeScript, Tailwind CSS, and Drizzle ORM</p>
      </div>
    </div>
  </div>
</template>
