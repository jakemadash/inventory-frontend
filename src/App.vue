<script setup>
import { ref, nextTick } from 'vue'
import { useAxios } from './composables/useAxios'

const { get, post, update, remove, apiResponse, apiError } = useAxios('artists')

const name = ref('')
const genres = ref('')
const modalRef = (ref < HTMLDivElement) | (null > null)
const editingId = (ref < number) | (null > null)
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
  console.log('ok')
  editingId.value = null
  editingName.value = ''
}

const handleSubmit = async (e) => {
  e.preventDefault()
  if (!name.value.trim()) return

  await post({ artist: name.value, genres: genres.value })

  name.value = ''
  genres.value = ''
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
                +
              </button>
              <button class="error" @click="() => remove(item.artist_id)">-</button>
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
        <label for="genres">Genres:</label>
        <textarea id="genres" v-model="genres"></textarea>
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
