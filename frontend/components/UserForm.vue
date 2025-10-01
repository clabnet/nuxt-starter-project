<script setup lang="ts">
import { ref, watch } from 'vue';
import { useApi } from '~/composables/useApi';
import type { CreateUserInput, UserResponse } from '~/schemas/user.schema';

const props = defineProps<{
  user?: UserResponse | null;
}>();

const emit = defineEmits<{
  userCreated: [];
  userUpdated: [];
  resetForm: [];
}>();

const api = useApi();

const formData = ref<CreateUserInput>({
  name: '',
  surname: '',
  gender: 'male',
  isTrusted: false,
});

const isSubmitting = ref(false);
const error = ref<string | null>(null);
const isEditMode = ref(false);

const resetForm = () => {
  isEditMode.value = false;
  formData.value = {
    name: '',
    surname: '',
    gender: 'male',
    isTrusted: false,
  };
  error.value = null;
};

// Watch for user prop changes and populate form
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      isEditMode.value = true;
      formData.value = {
        name: newUser.name,
        surname: newUser.surname,
        gender: newUser.gender,
        isTrusted: newUser.isTrusted,
      };
      error.value = null;
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

const handleSubmit = async () => {
  error.value = null;

  // Validation
  if (!formData.value.name.trim()) {
    error.value = 'Name is required';
    return;
  }

  if (!formData.value.surname.trim()) {
    error.value = 'Surname is required';
    return;
  }

  isSubmitting.value = true;

  try {
    if (isEditMode.value && props.user) {
      // Update existing user
      await api.users.update(props.user.id, formData.value);
      emit('userUpdated');
    } else {
      // Create new user
      await api.users.create(formData.value);
      emit('userCreated');
      resetForm();
    }
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : `Failed to ${isEditMode.value ? 'update' : 'create'} user`;
  } finally {
    isSubmitting.value = false;
  }
};

const cancelEdit = () => {
  resetForm();
  emit('resetForm');
};
</script>

<template>
  <h2 class="mb-6 text-2xl font-semibold text-gray-800">
    {{ isEditMode ? 'Edit User' : 'Create User' }}
  </h2>

  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Error Message -->
    <div v-if="error" class="rounded-lg bg-red-50 p-3 text-sm text-red-800">
      {{ error }}
    </div>

    <!-- Name Field -->
    <div>
      <label for="name" class="mb-1 block text-sm font-medium text-gray-700">
        Name <span class="text-red-500">*</span>
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        placeholder="Enter first name"
        class="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:outline-none"
        :disabled="isSubmitting"
      />
    </div>

    <!-- Surname Field -->
    <div>
      <label for="surname" class="mb-1 block text-sm font-medium text-gray-700">
        Surname <span class="text-red-500">*</span>
      </label>
      <input
        id="surname"
        v-model="formData.surname"
        type="text"
        placeholder="Enter last name"
        class="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:outline-none"
        :disabled="isSubmitting"
      />
    </div>

    <!-- Gender Field -->
    <div>
      <label for="gender" class="mb-1 block text-sm font-medium text-gray-700">
        Gender <span class="text-red-500">*</span>
      </label>
      <select
        id="gender"
        v-model="formData.gender"
        class="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:outline-none"
        :disabled="isSubmitting"
      >
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
    </div>

    <!-- Is Trusted Field -->
    <div class="flex items-center">
      <input
        id="isTrusted"
        v-model="formData.isTrusted"
        type="checkbox"
        class="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300 focus:ring-2"
        :disabled="isSubmitting"
      />
      <label for="isTrusted" class="ml-2 block text-sm text-gray-700"> Mark as trusted user </label>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3">
      <button
        v-if="isEditMode"
        type="button"
        @click="cancelEdit"
        class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="isSubmitting"
      >
        New user
      </button>
      <button
        type="submit"
        class="btn-primary flex-1 rounded-lg focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="isSubmitting"
      >
        {{
          isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? 'Save' : 'Save'
        }}
      </button>
    </div>
  </form>
</template>
