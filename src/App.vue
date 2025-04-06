<script setup lang="ts">
import { useFetch } from './composables/useFetch'
const { apiResponse, apiError } = useFetch('artists')
</script>

<template>
  <header>
    <h1>Welcome</h1>
  </header>

  <main>
    <div class="api-response">
      <h2>API Response:</h2>
      <div v-if="apiResponse" v-html="apiResponse"></div>
      <p v-else-if="apiError" class="error">Error: {{ apiError }}</p>
      <p v-else>Loading...</p>
      <nav>
        <ul>
          <li>Artists</li>
          <li>Albums</li>
          <li>Genres</li>
          <li>Years</li>
        </ul>
      </nav>
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
