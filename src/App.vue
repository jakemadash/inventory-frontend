<script setup>
import { ref, computed } from 'vue'
import { useAxios } from './composables/useAxios'

const entityConfig = {
  artists: {
    label: 'Artist',
    pluralLabel: 'Artists',
    nameField: 'artist',
    idField: 'artist_id',
    hasGenres: true,
    extraFields: ['genres', 'albums'],
  },
  genres: {
    label: 'Genre',
    pluralLabel: 'Genres',
    nameField: 'genre',
    idField: 'genre_id',
    hasGenres: false,
    hasArtists: true,
    extraFields: ['artists'],
  },
  years: {
    label: 'Year',
    pluralLabel: 'Years',
    nameField: 'year',
    idField: 'year',
    hasGenres: false,
    extraFields: ['albums'],
  },
}

const viewMode = ref('artists')
const currentConfig = computed(() => entityConfig[viewMode.value])

const axiosArtists = useAxios('artists')
const axiosGenres = useAxios('genres')
const axiosAlbums = useAxios('albums') // only for years view

const currentAxios = computed(() => {
  if (viewMode.value === 'years') return axiosAlbums
  const axiosMap = {
    artists: axiosArtists,
    genres: axiosGenres,
  }
  return axiosMap[viewMode.value]
})

const name = ref('')
const genres = ref('')
const artists = ref('')
const albums = ref('')
const modalRef = ref(null)
const editingId = ref(null)
const isEditing = ref(false)

const openAddModal = () => {
  if (viewMode.value === 'years') return

  isEditing.value = false
  editingId.value = null
  name.value = ''
  genres.value = ''
  artists.value = ''
  albums.value = ''
  modalRef.value?.showPopover?.()
}

const openEditModal = (item) => {
  if (viewMode.value === 'years') return

  const config = currentConfig.value
  isEditing.value = true
  editingId.value = item[config.idField]
  name.value = item[config.nameField]

  genres.value = config.hasGenres && item.genres ? item.genres.join(', ') : ''
  artists.value = config.hasArtists && item.artists ? item.artists.join(', ') : ''

  if (viewMode.value === 'artists' && item.albums && Array.isArray(item.albums)) {
    albums.value = item.albums
      .map((a) => (a.title && a.year ? `${a.title} | ${a.year}` : a.title))
      .join('\n')
  } else {
    albums.value = ''
  }

  modalRef.value?.showPopover?.()
}

const handleSubmit = async (e) => {
  e.preventDefault()
  if (!name.value.trim()) return
  if (viewMode.value === 'years') return

  const config = currentConfig.value
  const payload = {
    [config.nameField]: name.value.trim(),
  }

  if (config.hasGenres) {
    payload.genres = genres.value
      ? genres.value
          .split(',')
          .map((g) => g.trim())
          .filter(Boolean)
      : []
  }

  if (config.hasArtists) {
    payload.artists = artists.value
      ? artists.value
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean)
      : []
  }

  if (viewMode.value === 'artists') {
    payload.albums = albums.value
      ? albums.value
          .split('\n')
          .map((line) => {
            const [title, year] = line.split('|').map((s) => s.trim())
            return title ? { title, year: year ? parseInt(year) : null } : null
          })
          .filter(Boolean)
      : []
  }

  try {
    if (isEditing.value && editingId.value !== null) {
      await currentAxios.value.update({ id: editingId.value, ...payload })
    } else {
      await currentAxios.value.post(payload)
    }

    name.value = ''
    genres.value = ''
    artists.value = ''
    albums.value = ''
    editingId.value = null
    isEditing.value = false

    await currentAxios.value.get()
    modalRef.value?.hidePopover?.()
  } catch (error) {
    console.error('Submit error:', error)
  }
}

const switchView = async (newView) => {
  viewMode.value = newView
  await currentAxios.value.get()
}

const getDisplayValue = (item, field) => {
  const value = item[field]

  if (viewMode.value === 'years' && field === 'albums' && Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : '—'
  }

  if (field === 'albums' && Array.isArray(value)) {
    return value.map((a) => (a.title && a.year ? `${a.title} (${a.year})` : a.title)).join(', ')
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : '—'
  }
  return value || '—'
}
</script>

<template>
  <header>
    <h1>🎵 Music Manager</h1>
  </header>

  <nav>
    <ul>
      <li>
        <a
          href="#"
          :class="{ active: viewMode === 'artists' }"
          @click.prevent="switchView('artists')"
        >
          Artists
        </a>
      </li>
      <li>
        <a
          href="#"
          :class="{ active: viewMode === 'genres' }"
          @click.prevent="switchView('genres')"
        >
          Genres
        </a>
      </li>
      <li>
        <a href="#" :class="{ active: viewMode === 'years' }" @click.prevent="switchView('years')">
          Years
        </a>
      </li>
    </ul>
  </nav>

  <main>
    <div class="api-response">
      <template v-if="currentAxios.apiResponse.value">
        <p v-if="currentAxios.apiResponse.value.length === 0">
          No {{ currentConfig.pluralLabel.toLowerCase() }} yet
        </p>
        <table v-else>
          <thead>
            <tr>
              <template v-if="viewMode === 'years'">
                <th>Year</th>
                <th>Albums</th>
              </template>
              <template v-else>
                <th>{{ currentConfig.label }}</th>
                <th v-for="field in currentConfig.extraFields" :key="field">
                  {{ field.charAt(0).toUpperCase() + field.slice(1) }}
                </th>
                <th>Actions</th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr
              :key="viewMode === 'years' ? item.year : item[currentConfig.idField]"
              v-for="item in currentAxios.apiResponse.value"
            >
              <template v-if="viewMode === 'years'">
                <td>{{ item.year }}</td>
                <td>{{ item.albums.join(', ') }}</td>
              </template>
              <template v-else>
                <td>{{ item[currentConfig.nameField] }}</td>
                <td v-for="field in currentConfig.extraFields" :key="field">
                  {{ getDisplayValue(item, field) }}
                </td>
                <td>
                  <button class="edit" @click="openEditModal(item)">✏️</button>
                  <button class="error" @click="currentAxios.remove(item[currentConfig.idField])">
                    🗑️
                  </button>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </template>

      <p v-else-if="currentAxios.apiError.value" class="error">
        Error: {{ currentAxios.apiError.value }}
      </p>

      <div v-else class="spinner"></div>
    </div>

    <button v-if="viewMode !== 'years'" class="add-button" @click="openAddModal">
      ➕ Add {{ currentConfig.label }}
    </button>

    <div popover id="add-new-modal" ref="modalRef">
      <h2>
        {{ isEditing ? `Edit ${currentConfig.label}` : `Add ${currentConfig.label}` }}
      </h2>
      <form @submit="handleSubmit">
        <div class="form-field">
          <label for="name">{{ currentConfig.label }} Name:</label>
          <input type="text" id="name" autofocus v-model="name" />
        </div>

        <div v-if="currentConfig.hasGenres" class="form-field">
          <label for="genres">Genres (comma separated):</label>
          <textarea id="genres" v-model="genres"></textarea>
        </div>

        <div v-if="currentConfig.hasArtists" class="form-field">
          <label for="artists">Artists (comma separated):</label>
          <textarea id="artists" v-model="artists"></textarea>
        </div>

        <div v-if="viewMode === 'artists'" class="form-field">
          <label for="albums">Albums (one per line, format: Title | Year):</label>
          <textarea id="albums" v-model="albums" rows="4"></textarea>
        </div>

        <input
          v-if="viewMode !== 'years'"
          type="submit"
          :value="isEditing ? 'Save Changes' : 'Add'"
        />
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
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

nav li a:hover {
  background-color: #2c3e50;
}

nav li a.active {
  background-color: #1a252f;
  font-weight: bold;
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
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
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
  transition: background-color 0.2s;
}

.add-button:hover {
  background: #2980b9;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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
