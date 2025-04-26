<script setup lang="ts">
import { ref } from 'vue'
import { useFetch } from './composables/useFetch'

const name = ref('')
const modalRef = ref<HTMLDivElement | null>(null)

const { apiResponse, apiError, fetchData } = useFetch('artists')

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  if (!name.value.trim()) return

  await useFetch('artists', {
    method: 'post',
    data: { artist: name.value },
  }).fetchData()

  name.value = ''
  await fetchData()
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
      <div v-if="apiResponse" v-html="apiResponse"></div>
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
