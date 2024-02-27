

<!-- Main.svelte -->

<style>
  .Main {
    grid-template-columns: minmax(auto, 936px);
    justify-content: center;
    background-color: #fafafa;
  }
  .Main-container {
   background: rgb(36, 40, 47);
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* Define dos columnas en la cuadrícula */
    grid-gap: 1rem; /* Espaciado entre las tarjetas */
    padding: 0.5rem;
  }
</style>

<div class="Main">
  <div class="Main-container">
    <slot/>
  </div>
  </div>