import { ref, onMounted } from 'vue'
import axios from 'axios'

export const useAxios = (entity) => {
  axios.defaults.baseURL = 'http://localhost:3000/'

  const apiResponse = ref(null)
  const apiError = ref(null)

  const handleError = (e) => {
    if (axios.isAxiosError(e)) {
      apiError.value = `HTTP error! Status: ${e.response?.status} - ${e.response?.statusText}`
    } else if (e instanceof Error) {
      apiError.value = e.message
    } else {
      apiError.value = 'An unknown error occurred'
    }
  }

  const get = async () => {
    try {
      const response = await axios.get(entity)
      console.log('res:', entity.toString(), response)
      apiResponse.value = response.data
    } catch (e) {
      handleError(e)
    }
  }

  const post = async (data) => {
    try {
      await axios.post(`${entity}/new`, data)
    } catch (e) {
      handleError(e)
    }
  }

  const update = async (data) => {
    const id = data.id
    try {
      await axios.put(`${entity}/${id}/edit`, data)
    } catch (e) {
      handleError(e)
    }
  }

  const remove = async (id) => {
    try {
      await axios.delete(`${entity}/${id}/delete`)
      await get()
    } catch (e) {
      handleError(e)
    }
  }

  onMounted(get)
  return { get, post, update, remove, apiResponse, apiError }
}
