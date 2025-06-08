<script setup>
import { ref, nextTick } from 'vue'
import { useAxios } from './composables/useAxios'

const { get, post, update, remove, apiResponse, apiError } = useAxios('artists')

const name = ref('')
const genres = ref('')
const modalRef = ref(null)
const editingId = ref(null)
const editingName = ref('')

const startEditing = async (id, currentName) => {
  editingId.value = id
  editingName.value = currentName
  await nextTick()
  const inputElement = document.querySelector(`#edit-input-${id}`)
  inputElement?.focus()
}

const saveEdit = async (id) => {
  if (!editingName.value.trim()) return
  await update({ id, artist: editingName.value })
  editingId.value = null
  editingName.value = ''
  await get()
}

const cancelEdit = () => {
  editingId.value = null
  editingName.value = ''
}

const handleSubmit = async (e) => {
  e.preventDefault()
  if (!name.value.trim()) return
  await post({ artist: name.value, genres: genres.value ? genres.value.split(', ') : [] })
  name.value = ''
  genres.value = ''
  await get()
  modalRef.value?.hidePopover?.()
}
</script>

<template>
  <header>
    <h1>🎵 Music Manager</h1>
  </header>

  <nav>
    <ul>
      <li><a href="#">Artists</a></li>
      <li><a href="#">Albums</a></li>
      <li><a href="#">Genres</a></li>
      <li><a href="#">Years</a></li>
    </ul>
  </nav>

  <main>
    <div class="api-response">
      <template v-if="apiResponse">
        <p v-if="apiResponse.length === 0" class="">No artists yet</p>
        <table v-else>
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in apiResponse" :key="item.artist_id">
              <td>
                <div v-if="editingId === item.artist_id">
                  <input
                    :id="`edit-input-${item.artist_id}`"
                    v-model="editingName"
                    @keyup.enter="saveEdit(item.artist_id)"
                    @blur="cancelEdit"
                  />
                </div>
                <div v-else>
                  {{ item.artist ?? '—' }}
                </div>
              </td>
              <td>
                <button class="edit" @click="() => startEditing(item.artist_id, item.artist)">
                  ✏️
                </button>
                <button class="error" @click="() => remove(item.artist_id)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </template>

      <p v-else-if="apiError" class="error">Error: {{ apiError }}</p>
      <div v-else class="spinner"></div>
    </div>

    <button class="add-button" popovertarget="add-new-modal">➕ Add new</button>

    <div popover id="add-new-modal" ref="modalRef">
      <h2>Add Artist</h2>
      <form @submit="handleSubmit">
        <div class="form-field">
          <label for="name">Name:</label>
          <input type="text" id="name" autofocus v-model="name" />
        </div>
        <div class="form-field">
          <label for="genres">Genres (comma separated):</label>
          <textarea id="genres" v-model="genres"></textarea>
        </div>
        <input type="submit" value="Add" />
      </form>
    </div>
    <div id="modal-overlay"></div>
  </main>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
  margin: 0;
  background: #f8f9fa;
}

body {
  display: block !important;
  align-items: initial !important;
  justify-items: initial !important;
  place-items: initial !important;
}

header {
  background: #2c3e50;
  color: white;
  padding: 1rem;
  text-align: center;
}

nav {
  background: #34495e;
}

nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0.5rem 1rem;
  gap: 1rem;
}

nav li a {
  color: white;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
}

nav li a:hover {
  background-color: #2c3e50;
  border-radius: 4px;
}

main {
  padding: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.api-response {
  margin-top: 1.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

input[type='text'],
textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  font-weight: 600;
  margin: 0 5px;
  cursor: pointer;
  border: none;
  background: transparent;
}

.edit {
  color: green;
}

.error {
  color: red;
}

.add-button {
  margin-top: 2rem;
  background: #3498db;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 5px;
  font-size: 1rem;
}

.message {
  font-size: 2rem;
}

.add-button:hover {
  background: #2980b9;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

#add-new-modal {
  max-width: 400px;
  margin: auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 2rem;
  background: white;
  z-index: 20;
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

.spinner {
  width: 32px;
  height: 32px;
  border: 4px solid rgba(0, 0, 0, 0.2);
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 2rem auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
