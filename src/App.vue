<script setup lang="ts">
import { ref } from 'vue'
import { useAxios } from './composables/useAxios'

const name = ref('')
const modalRef = ref<HTMLDivElement | null>(null)

const { get, post, remove, apiResponse, apiError } = useAxios('artists')

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  if (!name.value.trim()) return

  await post({ artist: name.value })

  name.value = ''
  await get()
  modalRef.value?.hidePopover?.()
}
</script>

<template>
  <header>
    <h1>Artists List</h1>
  </header>

  <nav>
    <ul>
      <li>Artists</li>
      <li>Albums</li>
      <li>Genres</li>
      <li>Years</li>
    </ul>
  </nav>

  <main>
    <div class="api-response">
      <table v-if="apiResponse">
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in apiResponse" :key="item.id">
            <td>{{ item.name ?? '—' }}</td>
            <td>
              <button class="edit">+</button>
              <button class="error" @click="() => remove(item.id)">-</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else-if="apiError" class="error">Error: {{ apiError }}</p>
      <p v-else>Loading...</p>
    </div>
    <button popovertarget="add-new-modal">Add new</button>

    <div popover id="add-new-modal" ref="modalRef">
      <form @submit="handleSubmit">
        <label for="name">Name:</label>
        <input type="text" id="name" autofocus v-model="name" />
        <input type="submit" value="Add" />
      </form>
    </div>
    <div id="modal-overlay"></div>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

button {
  font-weight: 600;
  margin: 0 5px;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

.api-response {
  margin-top: 2rem;
}

.error {
  color: red;
}

.edit {
  color: green;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  #add-new-modal {
    margin: auto;
    border: 1px;
    border-radius: 5px;
    padding: 30px;
  }

  #modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(3px);
    z-index: 10;
    display: none;
    pointer-events: none;
  }

  #add-new-modal:popover-open ~ #modal-overlay {
    display: block;
    pointer-events: all;
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
