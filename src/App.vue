<script setup lang="ts">
import { ref, onMounted } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'

const apiResponse = ref<string | null>(null)
const apiError = ref<string | null>(null)

const fetchData = async () => {
  try {
    const response = await fetch('http://localhost:3000/artists')
    console.log(response)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    apiResponse.value = await response.text()
  } catch (error) {
    apiError.value = (error as Error).message
  }
}

onMounted(fetchData)
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <main>
    <TheWelcome />

    <div class="api-response">
      <h2>API Response:</h2>
      <div v-if="apiResponse" v-html="apiResponse"></div>
      <p v-else-if="apiError" class="error">Error: {{ apiError }}</p>
      <p v-else>Loading...</p>
    </div>
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
