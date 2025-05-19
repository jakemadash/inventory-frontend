import { ref, onMounted } from 'vue'
import axios from 'axios'

type EntityPostData = {
  id?: number
  name?: string
  genres?: string
}

type EntityItem = {
  id: number
  name: string
}

export const useAxios = (entity: string) => {
  axios.defaults.baseURL = 'http://localhost:3000/'

  const apiResponse = ref<EntityItem[] | null>(null)
  const apiError = ref<string | null>(null)

  const handleError = (e: unknown) => {
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
      console.log('res:', entity.toString(), response.data)
      apiResponse.value = response.data
    } catch (e) {
      handleError(e)
    }
  }

  const post = async (data: EntityPostData) => {
    try {
      await axios.post(`${entity}/new`, data)
    } catch (e) {
      handleError(e)
    }
  }

  const update = async (data: EntityPostData) => {
    const id = data.id
    try {
      await axios.put(`${entity}/${id}/edit`, data)
    } catch (e) {
      handleError(e)
    }
  }

  const remove = async (id: number) => {
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
